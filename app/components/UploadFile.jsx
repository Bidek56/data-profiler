import { useMutation, gql } from "@apollo/client";
import { Fragment } from 'react';

const SINGLE_UPLOAD = gql`
  mutation Upload($file: Upload!) {
    singleUpload(file: $file) {
      id
      filename
      mimetype
      path
    }
  }
`

const UploadFile = () => {
  const [uploadFile, { loading, error }] = useMutation(SINGLE_UPLOAD,
   {
     update( cache, { data: { uploadFile }}) {
       cache.modify({
         id: cache.identify(""),
         fields: {
           // TODO: https://www.apollographql.com/docs/react/caching/cache-interaction/
         }
       });
     }
   }
  );
  
  const onChange = ({
    target: { validity, files: [file] }
  }) => {
    console.log(file);
    validity.valid && uploadFile({ variables: { file } })    
  };

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>{JSON.stringify(error, null, 2)}</div>;

  return (
    <Fragment>
      <input id="file-uploader" type="file" required onChange={onChange} />
    </Fragment>
  );
};

export default UploadFile;
