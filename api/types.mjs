export default /* GraphQL */ `
  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
  }

  type Profile {
    id: ID!
    path: String!
    rowCount: Int
  }

  input FileInput {
    path: String!
  }

  type Query {
    uploads: [File]
    profile(file: FileInput!): [Profile]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    multipleUpload(files: [Upload!]!): [File!]!
  }
`
