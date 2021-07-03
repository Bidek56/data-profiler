import {readFileSync} from 'fs'
import { ApolloServer, gql } from 'apollo-server-koa'
import Koa from 'koa'
import * as resolvers from './resolvers'
import dotenv from 'dotenv'

const main = async () => {
  const app = new Koa()

  const typeDefs = gql(readFileSync('./typeDefs.graphql', 'utf8'))

  dotenv.config()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    uploads: {
      // Limits here should be stricter than config for surrounding
      // infrastructure such as Nginx so errors can be handled elegantly by
      // graphql-upload:
      // https://github.com/jaydenseric/graphql-upload#type-uploadoptions
      maxFileSize: 10000000, // 10 MB
      maxFiles: 20
    }
  })

  server.applyMiddleware({ app })

  app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.info(
      `Serving http://localhost:${process.env.PORT} for ${
        process.env.NODE_ENV
      }.`
    )
  })
}

main().catch(error => console.error(error))
