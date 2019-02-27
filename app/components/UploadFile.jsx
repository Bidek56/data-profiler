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
  const handleChange = e => {
    const { target } = e;
    const {
      validity,
      files: [file]
    } = target;

    return validity.valid &&

    mutate({
      variables: { file },
      update: (store, { data: { singleUpload }}) => {
        const data = store.readQuery({ query: UPLOADS });

        console.log("UPLOAD:", singleUpload.path);

        data.uploads.push(singleUpload);
        store.writeQuery({ query: UPLOADS, data });

        // Reset the input so onChange can fire again
        target.type = "";
        target.type = "file";
      }
    });
  };

  return (
    <input id="file-uploader" type="file" required onChange={handleChange} />
  )
}

export default graphql(SINGLEUPLOAD)(UploadFile)
