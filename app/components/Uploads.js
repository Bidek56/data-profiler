import axios from 'axios'
import { Component } from 'react'
import { graphql } from 'react-apollo'
import uploadsQuery from '../queries/uploads'
import Profile from './Profile'
import { Table, Head, Cell } from './Table'

class Uploads extends Component {
  constructor(props) {
    super(props)
    this.state = { uploads: props.data.uploads }
  }

  handleCancel = async () => {
    await this.getPosts()
  }

  handleProcess = async postId => {
    this.setState({
      uploads: this.state.uploads.map(item => ({ ...item, profile: null }))
    })

    const file = this.state.uploads.filter(item => postId === item.id)

    if (!file || file.length > 1)
      // console.error('Path for: ' + postId + ' not found')
      return

    const [{ path }] = file

    let result = await axios({
      url: 'http://localhost:3001/graphql',
      method: 'post',
      data: {
        query: `
        query profile {
          profile(file: { path: "${path}" } ) {
            path
            rowCount
          }
        }
          `
      }
    })

    this.setState({
      uploads: this.state.uploads.map(item => {
        if (postId === item.id)
          return { ...item, profile: result.data.data.profile }
        else return item
      })
    })
  }

  handleDelete = async () => {
    // console.log("Delete:", postId);
    // await fetch(`/posts/${postId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'content-type': 'application/json',
    //     accept: 'application/json',
    //   },
    // });
    // await this.getPosts();
  }

  render() {
    // console.log("Uploads2:", this.state.uploads);

    if (!this.state) return <div>State is null</div>

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
          tbody={this.state.uploads.map(({ id, filename, mimetype, path }) => (
            <tr key={id}>
              <td>
                <button onClick={e => this.handleProcess(id)}>Process</button>
              </td>
              <Cell>{filename}</Cell>
              <Cell>{mimetype}</Cell>
              <Cell>{path}</Cell>
            </tr>
          ))}
        />
        <div>
          {this.state.uploads.length > 0
            ? this.state.uploads.map(item => {
              if (item.profile)
                // return item.profile[0].path + ":" + item.profile[0].rowCount;
                return <Profile key={item.id} item={item} />
            })
            : 'No profiles to show'}
        </div>
      </div>
    )
  }
}

export default graphql(uploadsQuery)(Uploads)
