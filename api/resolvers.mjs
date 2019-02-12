import fs from 'fs'
import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'
import promisesAll from 'promises-all'
import shortid from 'shortid'
import alasql from 'alasql'

const UPLOAD_DIR = './uploads'
const db = lowdb(new FileSync('db.json'))

// Seed an empty DB.
db.defaults({ uploads: [] }).write()

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR)

const storeFS = ({ stream, filename }) => {
  const id = shortid.generate()
  const path = `${UPLOAD_DIR}/${id}-${filename}`
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file.
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ id, path }))
  )
}

const storeDB = file =>
  db
    .get('uploads')
    .push(file)
    .last()
    .write()

const deleteDB = path =>
  db
    .get('uploads')
    .remove({ path: path })
    .write()

const processUpload = async upload => {
  const { createReadStream, filename, mimetype } = await upload
  const stream = createReadStream()
  const { id, path } = await storeFS({ stream, filename })
  return storeDB({ id, filename, mimetype, path })
}

const processDelete = async path => {
  fs.unlink(path, err => {
    if (err && err.code == 'ENOENT')
      console.error(`File ${path} does NOT exists`)
    else if (err) console.error('Error occurred while trying to remove file')
    else console.log(`File ${path} was removed`)
  })
  const res = deleteDB(path)

  if (res.length) return res[0]
  else
    return {
      id: '1',
      filename: 'Error',
      mimetype: '',
      path: 'File not found'
    }
}

async function processProfile(obj) {
  const { file } = obj

  let res = await alasql.promise(
    `select Banner as att1, Brand as att2, SUM(EqVol) as val from xlsx('${file}') group by Banner,Brand`
  )

  // console.log('Res:', res)
  const iterator = res[Symbol.iterator]()

  // console.log("Rows in worksheet:", iterator);
  return iterator
}

export default {
  Query: {
    uploads: () => db.get('uploads').value(),
    profile: (obj, file) => processProfile(file)
  },
  Mutation: {
    singleUpload: (obj, { file }) => processUpload(file),
    async multipleUpload(obj, { files }) {
      const { resolve, reject } = await promisesAll.all(
        files.map(processUpload)
      )

      if (reject.length)
        reject.forEach(({ name, message }) =>
          // eslint-disable-next-line no-console
          console.error(`${name}: ${message}`)
        )

      return resolve
    },
    delete: (obj, { path }) => processDelete(path)
  }
}
