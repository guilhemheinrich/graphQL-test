import dotenv from "dotenv"
import neo4j from 'neo4j-driver'
import { gql } from "apollo-server-express";
import { Neo4jGraphQL } from "@neo4j/graphql";

dotenv.config()

const typeDefs = gql`
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