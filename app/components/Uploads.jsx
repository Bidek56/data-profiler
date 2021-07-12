import Profile from './Profile'
import Correlate from './Correlate'
import { useQuery, useLazyQuery, useMutation, gql } from "@apollo/client";

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

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

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function Uploads() {

  // const { corrData, corrLoading, corrError } = useQuery(GET_CORR);
  const [ getProfile, profile ] = useLazyQuery(GET_PROFILE);

  const classes = useStyles();
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

  if (profile.loading) return <div suppressHydrationWarning={true}><p>Loading Profile.....</p></div>;
  if (profile.error) return <div suppressHydrationWarning={true}>{JSON.stringify(profile.error, null, 2)}</div>;

  // console.log("profile data:", profile.data && profile.data.profile)
  // console.log("profile loading:", profileLoading)

  return (
    <div>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
         <TableHead>
            <TableRow>
               <TableCell>Profile</TableCell>
               <TableCell>Del</TableCell>
               <TableCell>Filename</TableCell>
               <TableCell>MIME type</TableCell>
               <TableCell>Path</TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
           {data.uploads.map(({ id, filename, mimetype, path }) => (
              <TableRow key={id}>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => getProfile( { variables: { file: filename } })}>Profile</Button>
                </TableCell>
                <TableCell>
                   <Button variant="contained" color="secondary" onClick={() => { del( { variables: { path }} ); profile.data = null }}>Del</Button>
                 </TableCell>
                 <TableCell>{filename}</TableCell>
                 <TableCell>{mimetype}</TableCell>
                 <TableCell>{path}</TableCell>
              </TableRow>
           ))}
           </TableBody>
       </Table>
      </TableContainer>
       <div>
         {profile.data && profile.data.profile && profile.data.profile.length > 0 ? 
               <Profile item={profile.data.profile} />
                //  if (item.correlate) {
                //    // return item.profile[0].path + ":" + item.profile[0].rowCount;
                //    return <Correlate key={item.id} item={item} />
                //  }
             : 'No profiles to show'}
         </div>
    </div>
  )
}