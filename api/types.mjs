export default /* GraphQL */ `
  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
  }

  type Profile {
    att1: String
    att2: String
    val: Float
  }

  input FileInput {
    path: String!
  }

  type Query {
    uploads: [File]
    profile(file: String!): [Profile]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    multipleUpload(files: [Upload!]!): [File!]!
    delete(path: String!): File
  }
`
