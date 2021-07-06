import { ApolloServer, gql } from 'apollo-server'
import * as resolvers from './resolvers'
import fs from 'fs'

const LIST_UPLOADS = gql`
  query uploads {
    uploads {
      id
      filename
      mimetype
      path
    }
  }
`

const GET_CORRELATION = gql`
  query correlate($file: String!) {
    correlate(file: $file) {
      column_x
      column_y
      correlation
    }
  }
`

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

const DELETE = gql`
  mutation delete($path: String!) {
    delete(path: $path) {
      id
      path
    }
  }
`

let server: ApolloServer;

beforeAll(async () => {
  const typeDefs = gql(fs.readFileSync('./typeDefs.graphql', "utf-8"))
  
  // create a test server to test against, using our production typeDefs, resolvers, and dataSources.
  server = new ApolloServer({
    typeDefs,
    resolvers
  })
})

it('test bad file delete', async () => {
  let res = await server.executeOperation({ query: DELETE, variables: { path: '/does/not/exist' } })
  expect(res?.errors).not.toBeUndefined()
  expect(res?.errors?.length).toBeGreaterThan(0)
  expect(res?.errors?.[0].message).not.toBeUndefined()
  expect(res?.errors?.[0].message).not.toBeUndefined()
  expect(res?.errors?.[0].message).toEqual('File not found')
})

it('test file upload', async () => {
  const test_file = 'financial-sample.xlsx'

  let res = await server.executeOperation({ 
    query: UPLOAD,
      variables: {
        file: {
          createReadStream: () => {
            return fs.createReadStream(test_file)
          },
          filename: test_file
        }
      } } );
    // console.log('Upload res:', res)

  expect(res.errors).toBeUndefined()
  expect(res?.data?.singleUpload).not.toBeUndefined()
  expect(res?.data?.singleUpload.id).not.toBeUndefined()
  expect(res?.data?.singleUpload.filename).toEqual(test_file)

  const path = res?.data?.singleUpload.path

  // console.log('Path:', path)

  // run query against the server and snapshot the output
  res = await server.executeOperation({ query: GET_PROFILE, variables: { file: path } });
  
  // console.log('Profile res:', res.data?.profile)
  expect(res.data).not.toBeUndefined()
  expect(res.data?.profile).not.toBeUndefined()
  expect(res.data?.profile.length).toEqual(25)

  res = await server.executeOperation({ query: GET_CORRELATION, variables: { file: path } });

  // console.log('Corr', res.data)

  expect(res.errors).toBeUndefined()
  expect(res.data?.correlate).not.toBeUndefined()
  expect(res.data?.correlate.length).toBeGreaterThan(0)

  res = await server.executeOperation({ query: DELETE, variables: { path } });

  // console.log('Del res:', res)

  expect(res.errors).toBeUndefined()
  expect(res.data?.delete).not.toBeUndefined()
  expect(res.data?.delete?.id).not.toBeUndefined()
  expect(res.data?.delete?.path).toEqual(path) 
})

it('test upload list', async () => {
  // run query against the server and snapshot the output
  const res = await server.executeOperation({ query: LIST_UPLOADS });
  
  // console.log(res.data)

  expect(res.errors).toBeUndefined()
  expect(res.data?.uploads).not.toBeUndefined()
  expect(res.data?.uploads?.length).toBeGreaterThan(0)
})
