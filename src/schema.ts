import { makeExecutableSchema } from "graphql-tools";
import { stitchSchemas } from '@graphql-tools/stitch';
import { ServiceTypeDefs } from "./service/serviceSchema";
import ServiceResolvers from "./service/serviceResolver";
import neoSchema from "./service/neoSchema";

export const schema = makeExecutableSchema({
  typeDefs: ServiceTypeDefs,
  resolvers: ServiceResolvers,
});


export const gatewaySchema = stitchSchemas({
  subschemas: [
    schema,
    neoSchema,
  ]
});