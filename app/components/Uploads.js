import axios from 'axios'
import { Component } from 'react'
import { graphql } from 'react-apollo'
import uploadsQuery from '../queries/uploads'
import Profile from './Profile'
import Correlate from './Correlate'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

class Uploads extends Component {
  constructor(props) {
    super(props)
    this.state = { uploads: props.data.uploads }
  }

  handleCancel = async () => {
    await this.getPosts()
  }

  handleProfile = async path => {
    if (!path) return

    let result = await axios({
      url: 'http://localhost:3001/graphql',
      method: 'post',
      data: {
        query: `
        query profile {
          profile(file: "${path}" ) {
            att1
            att2
            val
          }
        }
          `
      }
    })

    this.setState({
      uploads: this.state.uploads.map(item => {
        if (path === item.path)
          return { ...item, profile: result.data.data.profile }
        else return item
      })
    })
  }

  handleCorrelate = async path => {
    if (!path) return

    let result = await axios({
      url: 'http://localhost:3001/graphql',
      method: 'post',
      data: {
        query: `
        query correlate {
          correlate(file: "${path}") {
            column_x
            column_y
            correlation
          }
        }
          `
      }
    })

    console.log('Corr:', result.data.data)

    this.setState({
      uploads: this.state.uploads.map(item => {
        if (path === item.path)
          return { ...item, correlate: result.data.data.correlate }
        else return item
      })
    })

    console.log('State: ', this.state)
  }

  handleDelete = async path => {
    console.log('Delete:', path)
    if (!path) return

    let result = await axios({
      url: 'http://localhost:3001/graphql',
      method: 'post',
      data: {
        query: `
        mutation delete {
          delete(path: "${path}" ) {
            id
            path
          }
        }
          `
      }
    })

    // console.log('Res: ', result.data.data.delete)

    const id = result.data.data.delete.id

    this.setState({
      uploads: this.state.uploads.filter(item => id != item.id)
    })
  }

  render() {
    // console.log("Uploads2:", this.state.uploads);

    if (!this.state || !this.state.uploads)
      return <div>List of files is empty</div>

    return (
      <div>
        <Table responsive>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Del</th>
              <th>Filename</th>
              <th>MIME type</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            {this.state.uploads.map(({ id, filename, mimetype, path }) => (
              <tr key={id}>
                <td>
                  <Button
                    variant="primary"
                    onClick={e => this.handleCorrelate(path)}
                  >
                    Corr
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={e => this.handleDelete(path)}
                  >
                    Del
                  </Button>
                </td>
                <td>{filename}</td>
                <td>{mimetype}</td>
                <td>{path}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          {this.state.uploads.length > 0
            ? this.state.uploads.map(item => {
                console.log('Item:', item.correlate)

                if (item.correlate)
                  // return item.profile[0].path + ":" + item.profile[0].rowCount;
                  // return <Profile key={item.id} item={item} />
                  return <Correlate key={item.id} item={item} />
              })
            : 'No profiles to show'}
        </div>
      </div>
    )
  }
}

export default graphql(uploadsQuery)(Uploads)
