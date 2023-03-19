import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {readFileSync} from 'fs'
import express from 'express'
import { gql } from 'apollo-server-express'
import http from 'http';
import cors from 'cors'
import bodyParser from 'body-parser';

import * as resolvers from './resolvers'
import dotenv from 'dotenv'

// import dotenv from 'dotenv'

// import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';


interface MyContext {
  token?: String;
}

const main = async () => {
  const typeDefs = gql(readFileSync('./typeDefs.graphql', 'utf8'))

  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  dotenv.config()

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  // Modified server startup
  await new Promise<void>((resolve) => httpServer.listen({ port: process.env.PORT  }, resolve));
  
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}/graphql`);
}

main().catch(error => console.error(error))
