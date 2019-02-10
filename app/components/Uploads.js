import { graphql } from 'react-apollo'
import uploadsQuery from '../queries/uploads'
import { Table, Head, Cell } from './Table'
import Profile from './Profile'
import { Component } from 'react'

class Uploads extends Component {

  constructor({ data: { uploads = [] } }) {
    super()
    this.uploads = uploads;
  }

  handleClick = (x, filename) => {
    console.log(filename);
  }

  render() {
    return (
      <div>
        <Table
          thead={
            <tr>
              <Head>Process</Head>
              <Head>Filename</Head>
              <Head>MIME type</Head>
              <Head>Path</Head>
            </tr>
          }
          tbody={this.uploads.map(({ id, filename, mimetype, path }) => (
            <tr key={id} >
              <td><button onClick={(e) => this.handleClick(e, path)}>Process</button></td>
              <Cell>{filename}</Cell>
              <Cell>{mimetype}</Cell>
              <Cell>{path}</Cell>
            </tr>
          ))}
        />
        <Profile />
      </div>
    )
  }
}

export default graphql(uploadsQuery)(Uploads)
