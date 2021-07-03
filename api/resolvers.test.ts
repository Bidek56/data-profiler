import { ApolloServer, gql } from 'apollo-server-koa'
import { createTestClient } from 'apollo-server-testing'
import * as resolvers from './resolvers'
import fs from 'fs'
// import { GraphQLResponse } from 'graphql-extensions'

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

let query: any
let mutate: any

beforeAll(async () => {
  const typeDefs = gql(fs.readFileSync('./typeDefs.graphql', "utf-8"))
  //   // create a test server to test against, using our production typeDefs, resolvers, and dataSources.
  const server = new ApolloServer({
    typeDefs,
    resolvers
  })
  // use the test server to create a query function
  const client = createTestClient(server)
  query = client.query
  mutate = client.mutate
})

it('test bad file delete', async () => {
  let res = await mutate({
    mutation: DELETE,
    variables: { path: '/does/not/exist' }
  })

  // console.log('Del res:', res)

  expect(res.errors).not.toBeUndefined()
  expect(res.errors[0].message).not.toBeUndefined()
  expect(res.errors[0].message).toEqual('File not found')
})

it('test file upload', async () => {
  const test_file = 'sample-eq-vol.xlsx'

  let res = await mutate({
    mutation: UPLOAD,
    variables: {
      file: {
        createReadStream: () => {
          return fs.createReadStream(test_file)
        },
        filename: test_file
      }
    }
  })

  // console.log('Upload res:', res)

  expect(res.errors).toBeUndefined()
  expect(res.data.singleUpload).not.toBeUndefined()
  expect(res.data.singleUpload.id).not.toBeUndefined()
  expect(res.data.singleUpload.filename).toEqual(test_file)

  const path = res.data.singleUpload.path

  console.log('Path:', path)

  // run query against the server and snapshot the output
  res = await query({
    query: GET_PROFILE,
    variables: { file: path }
  })

  // console.log('Profile res:', res.data)

  expect(res.data).not.toBeUndefined()
  expect(res.data.profile).not.toBeUndefined()
  // console.log(res.data.profile)
  expect(res.data.profile.length).toEqual(5)

  res = await mutate({
    mutation: DELETE,
    variables: { path }
  })

  expect(res.errors).toBeUndefined()
  expect(res.data.delete).not.toBeUndefined()
  expect(res.data.delete.id).not.toBeUndefined()
  expect(res.data.delete.path).toEqual(path)

  // console.log('Del res:', res)
})

it('test upload list', async () => {
  // run query against the server and snapshot the output
  let res = await query({
    query: LIST_UPLOADS
  })

  // console.log(res.data)

  expect(res.errors).toBeUndefined()
  expect(res.data.uploads).not.toBeUndefined()
  // expect(res.data.uploads.length).toBeGreaterThan(0)
})

it('test correlate', async () => {
  // run query against the server and snapshot the output
  let res = await query({
    query: GET_CORRELATION,
    variables: { file: './uploads/hXK5nhFXP-sample-eq-vol.xlsx' }
  })

  // console.log('Corr:', res)
  // console.log('Corr:', res.data)

  expect(res.errors).toBeUndefined()
  expect(res.data.correlate).not.toBeUndefined()
  expect(res.data.correlate.length).toBeGreaterThan(0)
})
