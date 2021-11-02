import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

import http from 'http';
import { gatewaySchema } from "./schema";
import { GraphQLSchema } from "graphql";

// const PORT = process.env.PORT || 3000;
// const app = express();
// // app.use("*", cors());
// app.use(helmet());
// app.use(compression());
// const server = new ApolloServer({
//   schema,
// });
// await server.start();
// server.applyMiddleware({ app, path: "/graphql" });
// const httpServer = createServer(app);
// httpServer.listen({ port: PORT }, (): void =>
//   console.log(`🚀GraphQL-Server is running on http://localhost:3000/graphql`)
// );

async function startApolloServer(schema: GraphQLSchema) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
const schema = gatewaySchema
startApolloServer(gatewaySchema)