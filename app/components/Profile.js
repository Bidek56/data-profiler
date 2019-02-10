import { graphql } from 'react-apollo'
import profileQuery from '../queries/profile'
import { Table, Head, Cell } from './Table'
import { Component } from 'react'

class Profile extends Component {

  // constructor({ data: { uploads = [] } }) {

  constructor(props) {
    super(props)
    console.log("Data:", props.data.profile);
    this.profile = props.data.profile;
  }

  handleClick = (x, filename) => {
    console.log(filename);
  }

  render() {
    return (
      <Table
        thead={
          <tr>
            <Head>Filename</Head>
            <Head>Rows</Head>
          </tr>
        }
        tbody={this.profile.map(({ path, rowCount }) => (
          <tr key={path} >
            <Cell>{path}</Cell>
            <Cell>{rowCount}</Cell>
          </tr>
        ))}
      />
    )
  }
}

export default graphql(profileQuery)(Profile)
