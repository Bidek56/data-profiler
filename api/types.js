export default /* GraphQL */ `
  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String
  }

  type Profile {
    att1: String
    att2: String
    val: Float
  }

  type Correlation {
    column_x: String
    column_y: String
    correlation: Float
  }

  input FileInput {
    path: String!
  }

  type Query {
    uploads: [File]
    profile(file: String!): [Profile]
    correlate(file: String!): [Correlation]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    delete(path: String!): File
  }
`
