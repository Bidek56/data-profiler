import { Component } from 'react'
import Profile from './Profile'
import Correlate from './Correlate'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { graphql, withApollo } from 'react-apollo'
import gql from 'graphql-tag'

const DEL = gql`
  mutation delete($path: String!) {
    delete(path: $path) {
      id
      path
    }
  }
`

const GET_UPLOADS = gql`
  query uploads {
    uploads {
      id
      filename
      mimetype
      path
    }
  }
`

const GET_CORR = gql`
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

class Uploads extends Component {
  constructor(props) {
    super(props)

    this.state = {
      uploads: []
    }
  }

  async runQuery() {
    const res = await this.props.client.query({
      query: GET_UPLOADS,
      fetchPolicy: 'no-cache'
    })

    if (!res || !res.data || !res.data.uploads) return

    this.setState({
      uploads: res.data.uploads
    })
  }

  componentDidMount() {
    console.log('componentDidMount()')

    this.runQuery()
  }

  componentDidUpdate(props) {
    console.log('componentDidUpdate()')

    props.data.refetch().then(result => {
      const uploads = Object.assign({}, this.state)
        .uploads.sort()
        .join()
      const newUploads = result.data.uploads.sort().join()

      if (uploads !== newUploads) {
        this.setState({
          uploads: result.data.uploads
        })
      }
    })
  }

  handleCancel = async () => {
    await this.getPosts()
  }

  handleProfile = async path => {
    if (!path) return

    const res = await this.props.client.query({
      query: GET_PROFILE,
      variables: { file: path }
    })

    if (!res || !res.data || !res.data.profile) return

    this.setState({
      uploads: this.state.uploads.map(item => {
        if (path === item.path) return { ...item, profile: res.data.profile }
        else return item
      })
    })
  }

  handleCorrelate = async path => {
    console.log('handleCorrelate(', path, ')')

    if (!path) return

    const res = await this.props.client.query({
      query: GET_CORR,
      variables: { file: path }
    })

    if (!res || !res.data || !res.data.correlate) return

    // console.log('Corr Res:', res.data)

    this.setState({
      uploads: this.state.uploads.map(item => {
        if (path === item.path)
          return { ...item, correlate: res.data.correlate }
        else return item
      })
    })
  }

  handleDelete = async path => {
    console.log('handleDelete(', path, ')')

    if (!path) return

    const res = await this.props.client.mutate({
      mutation: DEL,
      variables: { path },
      refetchQueries: { GET_UPLOADS }
    })

    if (!res || !res.data) return

    const uploads = Object.assign({}, this.state).uploads.filter(
      item => item.path !== path
    )
    //console.log("FILTERED:", JSON.stringify(afterDel));

    this.setState({ uploads })
  }

  render() {
    console.log('render({ uploads:', this.state.uploads, '})')

    if (!this.state || !this.state.uploads) return <div>Loading.....</div>

    return (
      <div>
        <Table responsive>
          <thead>
            <tr>
              <th>Profile</th>
              {/* <th>Correlate</th> */}
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
                    onClick={() => this.handleProfile(path)}
                  >
                    Profile
                  </Button>
                </td>
                {/* <td>
                  <Button
                    variant="primary"
                    onClick={e => this.handleCorrelate(path)}
                  >
                    Corr
                  </Button>
                </td> */}
                <td>
                  <Button
                    variant="danger"
                    onClick={() => this.handleDelete(path)}
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
                if (item.correlate) {
                  // return item.profile[0].path + ":" + item.profile[0].rowCount;
                  return <Correlate key={item.id} item={item} />
                }
                if (item.profile) {
                  return <Profile key={item.id} item={item} />
                }
              })
            : 'No profiles to show'}
        </div>
      </div>
    )
  }
}

// export default withApollo(Uploads)
export default graphql(GET_UPLOADS)(withApollo(Uploads))
