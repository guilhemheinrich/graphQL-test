import { stringify } from "querystring"
import { Quad } from "rdf-js"
import PREFIXES from './prefix'
import { gql } from "apollo-server-express";

export interface Gql_Resource {
    uri: string,
    name: string,

    isConcept: boolean
    class: string
    // class specific
    properties: string[]        // Liste des propriétés littérales
    inherits: string[]          // gestion de la chaine d'héritage, non géré de base dans graphQL
    // properties specific
    type: string,
    domains: string[]
}
interface ObjectProperty_Template {
    type: "Object"
    name: string
    valuetype: string
}
interface DatatypeProperty_Template {
    type: "Litteral"
    name: string
    valuetype: "String" | "Int" | "Float" | "Null" | "ID"
}

type PorpertyTemplate = ObjectProperty_Template | DatatypeProperty_Template
export class Gql_Generator {
    /**
     * @description Readonly array storing relevant information for the post processing
     * @date 23/11/2021
     * @type {{prefix: string, uri: string}[]}
     * @memberof Gql_Generator
     */
    readonly prefixes_array: {prefix: string, uri: string}[] = []
    readonly gql_resources_preprocesing: {
        [resource_identifier: string]: Gql_Resource
    } = {}

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
        let predicate = quad.predicate.value
        let object = quad.object.value
        const checkExistence = (uri: string) => { // Pour les classes
            if (!Object.keys(this.gql_resources_preprocesing).includes(uri)) {
                this.gql_resources_preprocesing[uri] = {
                    uri: uri,
                    name: uri,
                    class: "owl:Thing",
                    isConcept: false,
                    properties: [],
                    inherits: [],
                    type: '',
                    domains: []
                }
            }
        }

        switch (this.prefixer(predicate)) {
            case "ns:type":
            case "a":
                checkExistence(subject)
                switch (this.prefixer(object)) {
                    case "owl:Class":
                    case "rdfs:Class":
                        this.gql_resources_preprocesing[subject].isConcept = true
                        break;
                    case "owl:ObjectProperty":
                    case "owl:DatatypeProperty":
                        break;
                    case "owl:Restriction":
                        break;
                    default:
                }
                this.gql_resources_preprocesing[subject].class = object
                break;
            case "rdfs:subPropertyOf":
                // Handle property inheritance
                // TODO
                // checkExistence(subject)
                // this.gql_resources_preprocesing[subject].inherits.push(object)
                break;
            case "rdfs:subClassOf":
                // Handle class inheritance
                checkExistence(subject)
                this.gql_resources_preprocesing[subject].inherits.push(object)
                break;
            case "rdfs:label":
                // Handle __type of the class, or something else...
                checkExistence(subject)
                this.gql_resources_preprocesing[subject].name = object
                break;
            case "rdfs:comment":
                break;
            case "rdfs:range":
                checkExistence(subject)
                this.gql_resources_preprocesing[subject].type = object
                break;
            case "rdfs:domain":
                checkExistence(object)
                this.gql_resources_preprocesing[object].properties.push(subject)
                checkExistence(subject)
                this.gql_resources_preprocesing[subject].domains.push(object)
            case "owl:onProperty":
                break;
            case "owl:someValuesFrom":
                break;
            case "owl:qualifiedCardinality":
                break;
            case "owl:onDataRange":
                break;
            case "owl:onClass":
                break;
            default:
   
        }
    }

    templater() {
        let out_template = ''
        // Iterate over all concept
        let concepts = Object.values(this.gql_resources_preprocesing).filter(resource => resource.isConcept)
        const property_templater = (property: PorpertyTemplate) => {
            let out_string = this.shortener(property.name) + ': ' 
            // Include other processing here, like array, required, etc...
            // Infered from an owl:Restriction for example
            if (property.type == "Litteral") {
                out_string += property.valuetype
            } else {
                // Only accept one domain right now
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
                            break;
                        case "owl:ObjectProperty":
                            template_properties.push({
                                type: "Object",
                                name: property.uri,
                                valuetype: property.type 
                            })
                            break;
                    }
                }
            }
            let template = `
            type ${shortname} {
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