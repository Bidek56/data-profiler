import gql from 'graphql-tag'

export default gql`
  query profile {
    profile(file: { path: "./uploads/uJbEi4xTz-sample-eq-vol.xlsx" } ) {
      path
      rowCount
    }
  }
`
