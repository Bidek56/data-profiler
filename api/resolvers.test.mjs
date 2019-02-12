import "@babel/polyfill"
const apolloServerKoa = require('apollo-server-koa')
const { createTestClient } = require('apollo-server-testing');
const gql = require('graphql-tag');

import resolvers from './resolvers'
import typeDefs from './types'

const GET_PROFILE = gql`
  query profile($file: String!) {
      profile(file: $file) {
          file
      }
  }
`;

test("profile one file", async () => {

    // create a test server to test against, using our production typeDefs,
    // resolvers, and dataSources.
    const server = new apolloServerKoa.ApolloServer({
        typeDefs,
        resolvers,
    })

    // use the test server to create a query function
    const { query } = createTestClient(server);

    const test_file = "./uploads/uJbEi4xTz-sample-eq-vol.xlsx"

    // run query against the server and snapshot the output
    const res = await query({ query: GET_PROFILE, variables: { file: test_file } });

    expect(res.data).not.toBeUndefined();
    expect(res.data.profile).not.toBeUndefined();
    expect(res.data.profile[0].file).not.toBeUndefined();

    const { file } = res.data.profile[0];

    expect(file).toEqual(test_file);
});
