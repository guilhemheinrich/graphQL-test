import { stringify } from "querystring"
import { Quad } from "rdf-js"
import PREFIXES from './prefix'
import { gql } from "apollo-server-express";
// import {PorpertyTemplate, Gql_Resource} from './Gql_Resource'
export interface Gql_Resource {
    // Graphql layer
    uri: string,                
    name: string,
    isConcept: boolean
    // RDF layer
    isAbstract: boolean         // In case of a blank node
    class: string
    properties: string[]        // Liste des propriétés
    inherits: string[]          // gestion de la chaine d'héritage, non géré de base dans graphQL
    
    // Properties specific
    type: string,
    domains: string[]
    // OWL restriction layer
    isRequired: boolean
    isList: boolean

}
export interface _Porperty_Template {
    type: "Object" | "Litteral"
    name: string
    valuetype: string
    // isRequired: boolean
    // isList: boolean
}

export interface ObjectProperty_Template extends _Porperty_Template{
    type: "Object"
}

export interface DatatypeProperty_Template extends _Porperty_Template{
    type: "Litteral"
    name: string
    valuetype: "String" | "Int" | "Float" | "Null" | "ID"
}

export type PorpertyTemplate = ObjectProperty_Template | DatatypeProperty_Template


class Gql_Resource_Dictionary {
    [uri: string] : Gql_Resource
    constructor() {
        const handler = {
            get: function(target: Gql_Resource_Dictionary, prop: string) {
                if (!Object.keys(target).includes(prop)) {
                    target[prop] = {
                        uri: prop,              // Initialize with the uri
                        name: prop,             // Initialize with the uri
                        class: "owl:Thing",
                        isConcept: false,
                        isAbstract: false,
                        properties: [],
                        inherits: [],
                        domains: [],
                        type: '',
                        isRequired: false,
                        isList: false
                    }
                } 
                return Reflect.get(target, prop)

            }
        }
        return new Proxy(this, handler)
    }
}
export class Gql_Generator {
    /**
     * @description Readonly array storing relevant information for the post processing
     * @date 23/11/2021
     * @type {{prefix: string, uri: string}[]}
     * @memberof Gql_Generator
     */
    readonly prefixes_array: {prefix: string, uri: string}[] = []
    readonly gql_resources_preprocesing: Gql_Resource_Dictionary = new Gql_Resource_Dictionary()

    /**
     * Creates an instance of Gql_Generator.
     * @date 23/11/2021
     * @param {{prefix: string, uri: string}[]} prefixes_array
     * @memberof Gql_Generator
     */
    constructor(prefixes_array: {prefix: string, uri: string}[]) {
        this.prefixes_array = JSON.parse(JSON.stringify(prefixes_array))
    }


    /**
     * @description 
     * @date 23/11/2021
     * @param {string} uri
     * @return {*}  {string} Return the uri with prefixed format
     * @memberof Gql_Generator
     */
    prefixer(uri: string): string {
        for (let prefix_uri of this.prefixes_array) {
            if (uri.startsWith(prefix_uri.uri)) {
                return uri.replace(prefix_uri.uri, prefix_uri.prefix + ':')
            }         
        }
        return uri
    }

    private last_particule = new RegExp(/[\/#]([\d\w]*)$/gm)
    shortener(uri: string):string {
        let matches = uri.matchAll(this.last_particule)
        const _array = Array.from(matches)
        if (_array && _array.length > 0) {
            return _array[0][1]
        } else {
            return uri
        }
    }


    getInheritedValues(uri:string, key: "properties"): Array<string[]>
    getInheritedValues(uri:string, key: "inherits"): Array<string[]>
    getInheritedValues(uri: string, key: keyof Gql_Resource): Array< Gql_Resource[typeof key] > {
        let inherited_values: Array< Gql_Resource[typeof key] > = []

        const looper = (uri: string) => {
            let inheritance = this.gql_resources_preprocesing[uri].inherits
            inherited_values.push(this.gql_resources_preprocesing[uri][key])
            inheritance.forEach((uri_next) => looper(uri_next))
        }

        looper(uri)
        return inherited_values
    } 

    processRdf(quad: Quad) {
        // Some aliases
        let subject = quad.subject.value
        let blank_node = (quad.subject.termType == "BlankNode")
        let predicate = quad.predicate.value
        let object = quad.object.value
        this.gql_resources_preprocesing[subject].isAbstract = blank_node
        switch (this.prefixer(predicate)) {
            //            _  __         __      _  __ 
            //           | |/ _|       / /     | |/ _|
            //    _ __ __| | |_ ___   / / __ __| | |_ 
            //   | '__/ _` |  _/ __| / / '__/ _` |  _|
            //   | | | (_| | | \__ \/ /| | | (_| | |  
            //   |_|  \__,_|_| |___/_/ |_|  \__,_|_|  
            //                                        
            //     
            case "ns:type":
            case "a":
                // checkExistence(subject)
                switch (this.prefixer(object)) {
                    case "owl:Class":
                    case "rdfs:Class":
                        this.gql_resources_preprocesing[subject].isConcept = true
                        break
                    case "owl:ObjectProperty":
                    case "owl:DatatypeProperty":
                        break
                    case "owl:Restriction":
                        break
                    case "ns:Property":
                        this.gql_resources_preprocesing[subject].isConcept = false
                        break
                    default:
                }
                this.gql_resources_preprocesing[subject].class = object
                break
            case "rdfs:subPropertyOf":
                // Handle property inheritance
                // TODO
                // this.gql_resources_preprocesing[subject].inherits.push(object)
                break
            case "rdfs:subClassOf":
                // Handle class inheritance
                this.gql_resources_preprocesing[subject].inherits.push(object)               
                break
            case "rdfs:label":
                // Handle __type of the class, or something else...
                this.gql_resources_preprocesing[subject].name = object
                break
            case "rdfs:comment":
                break
            case "rdfs:range":
                this.gql_resources_preprocesing[subject].type = object
                break
            case "rdfs:domain":
                this.gql_resources_preprocesing[object].properties.push(subject)
                this.gql_resources_preprocesing[subject].domains.push(object)
                break
            //                  _ 
            //                 | |
            //     _____      _| |
            //    / _ \ \ /\ / / |
            //   | (_) \ V  V /| |
            //    \___/ \_/\_/ |_|
            //                    
            // 
            case "owl:onProperty":
                break
            case "owl:someValuesFrom":
                console.log(`${subject} ${predicate} ${object}`)
                break
            case "owl:qualifiedCardinality":
                let cardinality = Number(object)
                this.gql_resources_preprocesing[subject].isRequired = true 
                if (cardinality > 1) {
                    this.gql_resources_preprocesing[subject].isList = true
                }
                console.log(`${subject} ${predicate} ${object}`)
                break
            case "owl:onDataRange":
                console.log(`${subject} ${predicate} ${object}`)
                break
            case "owl:onClass":
                console.log(`${subject} ${predicate} ${object}`)
                break
            default:
   
        }
    }

    templater() {
        let out_template = ''
        // Iterate over all concept
        let concepts = Object.values(this.gql_resources_preprocesing).filter(resource => resource.isConcept && !resource.isAbstract)
        // Separate the owl:restriction
        let restrictions = Object.values(this.gql_resources_preprocesing).filter(resource => resource.isAbstract && this.prefixer(resource.class) == 'owl:Restriction')

        // Helper function to parse the properties into correct gql
        const property_templater = (property: PorpertyTemplate) => {
            let out_string = this.shortener(property.name) + ': ' 
            // Infered from an owl:Restriction for example
            if (property.type == "Litteral") {
                out_string += property.valuetype
            } else {
                // Only accept one range right now
                // Multiple domain/range should be handled via the use of Union (gql)
                let range = property.valuetype
                out_string += this.shortener(range) + ` @relationship(type: "${this.prefixer(property.name)}", direction: OUT)`
            }
            return out_string
        }

        for (let concept of concepts) {
            let shortname = this.shortener(concept.uri)
            let template_properties: PorpertyTemplate[] = []
            for (let properties of this.getInheritedValues(concept.uri, "properties"))  {
                for (let property_uri of properties) {
                    let property = this.gql_resources_preprocesing[property_uri]
                    switch (this.prefixer(property.class)) {
                        case "owl:DatatypeProperty":
                            template_properties.push({
                                type: "Litteral",
                                name: property.uri,
                                valuetype: "String"
                            })
                            break
                        case "owl:ObjectProperty":
                            template_properties.push({
                                type: "Object",
                                name: property.uri,
                                valuetype: property.type 
                            })
                            break
                    }
                }
            }
            let set_inherits: Set<string> = new Set()
            let set_restrictions_uri: string[]= restrictions.map((restriction) => restriction.uri)

            for (let inheritance_mail of this.getInheritedValues(concept.uri, "inherits")) {
                inheritance_mail.forEach((parent_uri) => {
                    // Only write non - owl:Restriction inheritance
                    if (!set_restrictions_uri.includes(parent_uri)) {
                        set_inherits.add(this.shortener(parent_uri))
                    }
                })        
            }
            // Iterate over set_restrictions_uri to update properties
            //    _            _       
            //   | |          | |      
            //   | |_ ___   __| | ___  
            //   | __/ _ \ / _` |/ _ \ 
            //   | || (_) | (_| | (_) |
            //    \__\___/ \__,_|\___/ 
            //                         
            // 
            let template_inherits = Array.from(set_inherits.values())
            let template = `
            interface ${shortname}_I implements ${template_inherits.map((short) => short + '_I').join(' & ')} {
                ${template_properties.map((prop) => property_templater(prop)).join('\n                ')}
            } 

            type ${shortname} implements ${[shortname, ...template_inherits].map((short) => short + '_I').join(' & ')} ${ template_inherits.length > 0 ? '@node(additionalLabels: [' + template_inherits.map((short_uri) => '"' + short_uri + '"') + '])': ''}{
                ${template_properties.map((prop) => property_templater(prop)).join('\n                ')}
            }            
            `
            out_template += template
        }
        return out_template
    }
}

export const RDF_parser = new Gql_Generator(PREFIXES) 
export default RDF_parser



// rdfs:subClassOf rdfs:Resource .

// rdfs:subClassOf a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "subClassOf" ;
// 	rdfs:comment "The subject is a subclass of a class." ;
// 	rdfs:range rdfs:Class ;
// 	rdfs:domain rdfs:Class .

// rdfs:subPropertyOf a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "subPropertyOf" ;
// 	rdfs:comment "The subject is a subproperty of a property." ;
// 	rdfs:range rdf:Property ;
// 	rdfs:domain rdf:Property .

// rdfs:comment a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "comment" ;
// 	rdfs:comment "A description of the subject resource." ;
// 	rdfs:domain rdfs:Resource ;
// 	rdfs:range rdfs:Literal .

// rdfs:label a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "label" ;
// 	rdfs:comment "A human-readable name for the subject." ;
// 	rdfs:domain rdfs:Resource ;
// 	rdfs:range rdfs:Literal .

// rdfs:domain a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "domain" ;
// 	rdfs:comment "A domain of the subject property." ;
// 	rdfs:range rdfs:Class ;
// 	rdfs:domain rdf:Property .

// rdfs:range a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "range" ;
// 	rdfs:comment "A range of the subject property." ;
// 	rdfs:range rdfs:Class ;
// 	rdfs:domain rdf:Property .

// rdfs:seeAlso a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "seeAlso" ;
// 	rdfs:comment "Further information about the subject resource." ;
// 	rdfs:range rdfs:Resource ;
// 	rdfs:domain rdfs:Resource .

// rdfs:isDefinedBy a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:subPropertyOf rdfs:seeAlso ;
// 	rdfs:label "isDefinedBy" ;
// 	rdfs:comment "The defininition of the subject resource." ;
// 	rdfs:range rdfs:Resource ;
// 	rdfs:domain rdfs:Resource .

// rdfs:Literal a rdfs:Class ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "Literal" ;
// 	rdfs:comment "The class of literal values, eg. textual strings and integers." ;
// 	rdfs:subClassOf rdfs:Resource .

// rdfs:Container a rdfs:Class ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "Container" ;
// 	rdfs:subClassOf rdfs:Resource ;
// 	rdfs:comment "The class of RDF containers." .

// rdfs:ContainerMembershipProperty a rdfs:Class ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "ContainerMembershipProperty" ;
// 	rdfs:comment """The class of container membership properties, rdf:_1, rdf:_2, ...,
//                     all of which are sub-properties of 'member'.""" ;
// 	rdfs:subClassOf rdf:Property .

// rdfs:member a rdf:Property ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "member" ;
// 	rdfs:comment "A member of the subject resource." ;
// 	rdfs:domain rdfs:Resource ;
// 	rdfs:range rdfs:Resource .

// rdfs:Datatype a rdfs:Class ;
// 	rdfs:isDefinedBy <http://www.w3.org/2000/01/rdf-schema#> ;
// 	rdfs:label "Datatype" ;
// 	rdfs:comment "The class of RDF datatypes." ;
// 	rdfs:subClassOf rdfs:Class .