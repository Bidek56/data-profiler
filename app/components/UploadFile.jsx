import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const UPLOADS = gql`
  query uploads {
    uploads {
      id
      filename
      mimetype
      path
    }
  }
`

const SINGLEUPLOAD = gql`
  mutation($file: Upload!) {
    singleUpload(file: $file) {
      id
      filename
      mimetype
      path
    }
  }
`

const UploadFile = ({ mutate }) => {
  const handleChange = ({
    target: {
      validity,
      files: [file]
    }
  }) =>
    validity.valid &&
    mutate({
      variables: { file },
      update(
        proxy,
        {
          data: { singleUpload }
        }
      ) {
        const data = proxy.readQuery({ query: UPLOADS })
        data.uploads.push(singleUpload)
        proxy.writeQuery({ query: UPLOADS, data })
      }
    })

  return (
    <input id="file-uploader" type="file" required onChange={handleChange} />
  )
}

export default graphql(SINGLEUPLOAD)(UploadFile)
