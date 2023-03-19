import type { AppProps } from 'next/app'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client'
import { setContext } from "apollo-link-context";

const middlewareUpdate = createUploadLink({ uri: "http://localhost:3001/graphql" });
const authLink = setContext((_, { headers }) => {
  // Leer el storage almacenado
  const token = localStorage.getItem("token");
  // console.log(token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'Apollo-Require-Preflight': 'true'
    },
  };
});

const client = new ApolloClient({
  connectToDevTools: true,
  cache: new InMemoryCache(),
  link: authLink.concat(middlewareUpdate),
  fetchOptions: {
    mode: "no-cors",
  },
})

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp