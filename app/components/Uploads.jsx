import Profile from './Profile'
import Correlate from './Correlate'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { useQuery, useMutation, gql } from "@apollo/client";

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

const handleProfile = async path => {
  console.log("Profile path: ", path)
  if (!path) return
}

export default function Uploads() {

  // const { corrData, corrLoading, corrError } = useQuery(GET_CORR);
  // const { profileData, profileLoading, profileError } = useQuery(GET_PROFILE);

  const { data, loading, error } = useQuery(GET_UPLOADS);
  const [del] = useMutation(DEL, {
    // Remove from the cache
    update(cache, {data: {del}}) {
      cache.modify( {
        fields: {
          uploads(existingUploads, {DELETE }) {
            return DELETE;
          },
        },
      })
    }
  });

  if (loading) return <div suppressHydrationWarning={true}><p>Loading.....</p></div>;
  if (error) return <div suppressHydrationWarning={true}>{JSON.stringify(error, null, 2)}</div>;

  // console.log("data len:", data.uploads.length)

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
           {data.uploads.map(({ id, filename, mimetype, path }) => (
              <tr key={id}>
                <td>
                  <Button variant="primary" onClick={() => handleProfile(path)}>Profile</Button>
                </td>
                <td>
                   <Button variant="danger" onClick={() => del( { variables: { path }} )}>Del</Button>
                 </td>
                 <td>{filename}</td>
                 <td>{mimetype}</td>
                 <td>{path}</td>
              </tr>
           ))}
           </tbody>
       </Table>
       <div>
         {data.uploads.length > 0
             ? data.uploads.map(item => {
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