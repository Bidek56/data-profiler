import gql from 'graphql-tag'

export default gql`
  query profile {
    profile(file: "./uploads/uJbEi4xTz-sample-eq-vol.xlsx") {
      file
      rowCount
    }
  }
`
