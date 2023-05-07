import gql from 'graphql-tag';
import { ApolloServer } from '@apollo/server';
import * as resolvers from './resolvers';
import fs from 'fs';
import { describe, beforeAll, expect, it } from "vitest";

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

const COLUMNS = gql`
  query columns($file: String!) {
    columns(file: $file)
  }
`

const UPLOAD = gql`
  mutation upload($upload: Upload!) {
    singleUpload(file: $upload) {
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

describe('Apollo server tests', () => {

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

    expect(res?.body.kind === "single").toBeTruthy();
    expect(res?.body.singleResult.errors).not.toBeUndefined()
    expect(res?.body.singleResult.errors?.length).toBeGreaterThan(0)
    expect(res?.body.singleResult.errors?.[0].message).not.toBeUndefined()
    expect(res?.body.singleResult.errors?.[0].message).not.toBeUndefined()
    expect(res?.body.singleResult.errors?.[0].message).toEqual('File not found')
  })

  it('test file upload', async () => {
    const test_file = 'financial-sample.xlsx'

    let res = await server.executeOperation({
      query: UPLOAD,
      variables: {
        upload: {
          file: {
            createReadStream: () => fs.createReadStream(test_file),
            filename: test_file,
            mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            encoding: '7bit'
          }
        }
      }
    });

    let single = res?.body.singleResult

    // console.log("Sing:", single);

    single?.errors && console.error('Error:', single.errors)

    expect(single.errors).toBeUndefined();
    expect(single).not.toBeUndefined()
    expect(single?.data).not.toBeUndefined()
    expect(single?.data.singleUpload.id).not.toBeUndefined()
    expect(single?.data.singleUpload.filename).toEqual(test_file)

    const path = single?.data.singleUpload.path

    // // console.log('Path:', path)

    // run query against the server and snapshot the output
    res = await server.executeOperation({ query: GET_PROFILE, variables: { file: path } });

    expect(res?.body.kind === "single").toBeTruthy();

    single = res?.body.singleResult

    expect(single.data).not.toBeUndefined()
    expect(single.data?.profile).not.toBeUndefined()
    expect(single.data?.profile.length).toEqual(25)

    res = await server.executeOperation({ query: GET_CORRELATION, variables: { file: path } });

    // // console.log('Corr', res.data)

    single = res?.body.singleResult
    expect(single.errors).toBeUndefined()
    expect(single.data?.correlate).not.toBeUndefined()
    expect(single.data?.correlate.length).toBeGreaterThan(0)

    res = await server.executeOperation({ query: DELETE, variables: { path } });
    single = res?.body.singleResult

    // console.log('Del res:', res)

    expect(single.errors).toBeUndefined()
    expect(single.data?.delete).not.toBeUndefined()
    expect(single.data?.delete?.id).not.toBeUndefined()
    expect(single.data?.delete?.path).toEqual(path)
  })

  it('test upload list', async () => {
    // run query against the server and snapshot the output
    const res = await server.executeOperation({ query: LIST_UPLOADS });

    // console.log(res?.body.singleResult)

    expect(res?.body.singleResult.errors).toBeUndefined();
    expect(res?.body.singleResult.data?.uploads).not.toBeUndefined()
    expect(res?.body.singleResult.data?.uploads?.length).toBeGreaterThanOrEqual(0)
  })

  it('test profile', async () => {

    // console.log('profile test')
    const res = await server.executeOperation({ query: GET_PROFILE, variables: { file: './financial-sample.csv' } });

    // console.log("Res:", res?.body.singleResult)

    expect(res?.body.singleResult.errors).toBeUndefined();
    expect(res?.body.singleResult.data?.profile).not.toBeUndefined();
    expect(res?.body.singleResult.data?.profile?.length).toBeGreaterThan(0);
  })

  it('test columns', async () => {
    const res = await server.executeOperation({ query: COLUMNS, variables: { file: './financial-sample.csv' } });
    expect(res?.body.singleResult.errors).toBeUndefined();
    expect(res?.body.singleResult.data?.columns).not.toBeUndefined();
    expect(res?.body.singleResult.data?.columns?.length).toBeGreaterThan(0);
  })
})