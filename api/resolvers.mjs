import fs from 'fs'
import apolloServerKoa from 'apollo-server-koa'
import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'
import promisesAll from 'promises-all'
import shortid from 'shortid'
import Excel from 'exceljs'

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

const processUpload = async upload => {
  const { createReadStream, filename, mimetype } = await upload
  const stream = createReadStream()
  const { id, path } = await storeFS({ stream, filename })
  return storeDB({ id, filename, mimetype, path })
}

async function processProfile(file) {
  const { file: { path } } = file

  // read from a file
  var workbook = new Excel.Workbook();

  if (!workbook) {
    console.error("Workbook undefined");
    return null;
  }

  await workbook.xlsx.readFile(path);

  // fetch sheet by id
  let worksheet = workbook.getWorksheet(2);

  // console.log(worksheet);
  if (!worksheet) {
    console.error("Worksheet undefined");
    return null;
  }

  let rowCount = 0;

  // Iterate over all rows (including empty rows) in a worksheet
  worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
    // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
    rowCount++;
  });

  const rows = [{ path, rowCount }];
  const iterator = rows[Symbol.iterator]();

  // console.log("Rows in worksheet:", iterator);
  return iterator;
}

export default {
  Upload: apolloServerKoa.GraphQLUpload,
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
    }
  }
}
