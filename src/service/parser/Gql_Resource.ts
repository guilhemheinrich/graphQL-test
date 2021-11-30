// A helper alias
type URI = string

export interface Base_Resource {
    // Graphql & application layer
    uri: string              
    name: string
    isConcept: boolean
    // RDF layer
    class: URI                  // A property is also a class a rdfs:Class
    inherits: URI[]             // Could be used even for relationship
}

export interface Node_Spec{
    isConcept: true
    isAbstract: boolean         // In case of a blank node
    properties: URI[]        // Liste des propriétés
}

export interface Edge_Spec {
    isConcept: false
    // Properties specific
    domains: URI[]
    range: URI[]
}

interface Gql_Resource {
        // Graphql & application layer
        uri: string              
        name: string
        isConcept: boolean
        // RDF layer
        class: URI                  // A property is also a class a rdfs:Class
        inherits: URI[]             // Could be used even for relationship

        node_spec: Node_Spec

        edge_spec: Edge_Spec
}

// export type Gql_Resource = Node_Resource | Edge_Resource

export interface _Porperty_Template {
    type: "Object" | "Litteral"
    name: string
    valuetype: string
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
