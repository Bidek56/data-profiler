import '@babel/polyfill'
import { ApolloServer, gql } from 'apollo-server-koa'
import { createTestClient } from 'apollo-server-testing'
import resolvers from './resolvers'
import typeDefs from './types'

const GET_PROFILE = gql`
  query profile($file: String!) {
    profile(file: $file) {
      att1
      att2
      val
    }
  }
`

test('profile one file', async () => {
  // create a test server to test against, using our production typeDefs,
  // resolvers, and dataSources.
  const server = new ApolloServer({
    typeDefs,
    resolvers
  })

  // use the test server to create a query function
  const { query } = createTestClient(server)

  const test_file = './uploads/uJbEi4xTz-sample-eq-vol.xlsx'

  // run query against the server and snapshot the output
  const res = await query({
    query: GET_PROFILE,
    variables: { file: test_file }
  })

  expect(res.data).not.toBeUndefined()
  expect(res.data.profile).not.toBeUndefined()
  // console.log(res.data.profile)
  expect(res.data.profile.length).toEqual(5)

  // const [{ file }] = res.data.profile
  // expect(file).toEqual(test_file)
})
