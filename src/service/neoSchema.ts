import dotenv from "dotenv"
import neo4j from 'neo4j-driver'
import { gql } from "apollo-server-express";
import { Neo4jGraphQL } from "@neo4j/graphql";

dotenv.config()

const typeDefs = gql`

# interface Person {
# userId: ID!
# name: String
# }

interface Animal_I {
  name: String!
}
interface Dog_I implements Animal_I{
  name: String!
  is_fed: Boolean
}
interface Dobberman_I implements Dog_I & Animal_I{
  name: String!
  is_fed: Boolean
  bite: Boolean
}
type Animal implements Animal_I {
  name: String!
}
type Dog implements Dog_I & Animal_I @node(additionalLabels: ["Animal"]) {
  name: String!
  is_fed: Boolean
}

type Dobberman implements Dobberman_I & Dog_I & Animal_I @node(additionalLabels: ["Animal", "Dog"]){
  name: String!
  is_fed: Boolean
  bite: Boolean
} 

# union Dog_Animals = Dog | Animal
# type Mutation {
#     updateOwlClassDog(ids: [ID]!): Dog
#         @cypher(
#             statement: """
#               UPDATE (a {__id})
#             """
#         )
# }

  # type Superstar_Person {
  #   name: String!
  #   movies: [Movie] @relationship(type: "ACTED_IN", direction: OUT)
  # }

  type Movie {
    title: String!
    year: Int
    plot: String
    actors: [Person] @relationship(type: "ACTED_IN", direction: IN)
  }

  type Person {
    name: String!
    movies: [Movie] @relationship(type: "ACTED_IN", direction: OUT)
  }
`;

const driver = neo4j.driver(
    <string>process.env.NEO4J_URI,
    neo4j.auth.basic(<string>process.env.NEO4J_USER, <string>process.env.NEO4J_PASSWORD)
  );

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
export const _neoSchema = neoSchema.schema

export default neoSchema