import 'cross-fetch/polyfill'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client'
import App, { Container } from 'next/app'
import Head from 'next/head'
import { getDataFromTree } from 'react-apollo'

const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
})

export default function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}


// export default class CustomApp extends App {
  // static async getInitialProps({ ctx, router, Component }) {
  //   const props = {}

  //   if (Component.getInitialProps)
  //     props.pageProps = await Component.getInitialProps(ctx)

  //   if (ctx.req) {
  //     const apolloClient = createApolloClient()
  //     try {
  //       await getDataFromTree(
  //         <CustomApp
  //           {...props}
  //           apolloClient={apolloClient}
  //           router={router}
  //           Component={Component}
  //         />
  //       )
  //     } catch (error) {
  //       // Prevent crash from GraphQL errors.
  //       // eslint-disable-next-line no-console
  //       console.error(error)
  //     }
  //     // Head.rewind()
  //     props.apolloCache = apolloClient.cache.extract()
  //   }

  //   return props
  // }

//   apolloClient =
//     this.props.apolloClient || createApolloClient(this.props.apolloCache)

//   render() {

//     // console.log(this.apolloClient);

//     const { Component, pageProps } = this.props
//     return (
//       <ApolloProvider client={this.apolloClient}>
//         <Component {...pageProps} />
//       </ApolloProvider>
//     )
//   }
// }
