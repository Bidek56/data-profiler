import {readFileSync} from 'fs'
import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import * as resolvers from './resolvers'
import dotenv from 'dotenv'
import { graphqlUploadExpress } from 'graphql-upload'

const main = async () => {

  const typeDefs = gql(readFileSync('./typeDefs.graphql', 'utf8'))

  dotenv.config()

  const server = new ApolloServer({ typeDefs, resolvers })

  await server.start();

  const app = express();

  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });

  app.listen({ port: process.env.PORT })

  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
}

main().catch(error => console.error(error))
