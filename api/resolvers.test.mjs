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

const UPLOAD = gql`
  mutation upload($file: Upload!) {
    singleUpload(file: $file) {
      id
      filename
      mimetype
      path
    }
  }
`

let query = null
let mutate = null

beforeAll(() => {
  // create a test server to test against, using our production typeDefs, resolvers, and dataSources.
  const server = new ApolloServer({
    typeDefs,
    resolvers
  })
  // use the test server to create a query function
  const client = createTestClient(server)
  query = client.query
  mutate = client.mutate
})

it('profile one file', async () => {
  const test_file = './uploads/IW0lb9EVl-sample-eq-vol.xlsx'

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

it('test file upload', async () => {
  const test_file = 'C:/temp/sel.csv'

  const res = await mutate({
    mutation: UPLOAD,
    variables: { file: test_file }
  })

  // console.log('Res:', res)
})
