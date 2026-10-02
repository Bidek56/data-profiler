import type { AppProps } from 'next/app'
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SetContextLink } from '@apollo/client/link/context';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';

const middlewareUpdate = new UploadHttpLink({ uri: "http://localhost:3001/graphql" });
const authLink = new SetContextLink((prevContext, operation) => {
  // Leer el storage almacenado
  const token = localStorage.getItem("token");
  // console.log(token);
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
      'Apollo-Require-Preflight': 'true'
    },
  };
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(middlewareUpdate),
})

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp