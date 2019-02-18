import fs from 'fs'
import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import alasql from 'alasql'
import { UserInputError } from 'apollo-server-koa'
import { num, arr } from 'jeezy'
import xlsx from 'xlsx'

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
        console.error('stream.truncated')
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

const processDelete = path => {
  fs.unlink(path, err => {
    if (err && err.code == 'ENOENT')
      console.error(`File ${path} does NOT exists`)
    else if (err) console.error('Error occurred while trying to remove file')
    // else console.log(`File ${path} was removed`)
  })
  const res = deleteDB(path)

  if (res.length) return res[0]
  else
    throw new UserInputError('File not found', {
      invalidArgs: path
    })
}

const correlate = () => {
  try {
    var data = []
    // var cols = 'abcdefghijklmnopqrstuvwxyz'.split('')
    var cols = 'abcdefghij'.split('')
    for (var i = 0; i <= 15; i++) {
      var obj = { index: i }

      cols.forEach(col => {
        obj[col] = num.randBetween(1, 100)
      })
      data.push(obj)
    }

    // console.log('data:', data)

    const corr = arr.correlationMatrix(data, cols)
    // console.log('Corr len:', corr.length)

    return corr
  } catch (ex) {
    console.error(ex)
  }
}

const parseExcel = filename => {
  console.log('File:', filename)

  const workbook = xlsx.readFile(filename)

  var sheet_name_list = workbook.SheetNames
  console.log('Sheets:', sheet_name_list)

  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]], {
    header: 1
  })

  // const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]], {
  //   raw: true
  // })

  // const dd = xlData.map((val, idx) => {
  //   return { ...val, index: idx }
  // })

  // console.log('Xl:', dd)

  const numericVals = xlData[1].map(item => {
    return typeof item === 'number'
  })

  console.log('Cols:', numericVals)

  let numericArray = []

  xlData.map(arry => {
    let result = []

    numericVals.map((val, idx) => {
      if (val) result.push(arry[idx])
    })

    numericArray.push(result)
  })

  console.log('Cont:', xlData.length)
  console.log('Numr:', numericArray.length)
  const columns = numericArray[0]
  console.log('Cols:', columns)

  // const xlData2 = numericArray.slice(1)
  // console.log('xlDate:', xlData2)

  // return
  // const columns = ['a1', 'b2', 'c3', 'd4']

  const corr = arr.correlationMatrix(numericArray, columns)
  console.log('Corr len:', corr)

  return corr
}

const processCorr = async ({ file }) => {
  console.log('In file:', file)
  const corr = correlate()

  // let corr = [0]
  // if (file.endsWith('.xlsx')) corr = parseExcel(file)
  // else {
  //   console.error('Invalid file type', file)

  //   throw new UserInputError('Invalid file type', {
  //     invalidArgs: file
  //   })
  // }

  return corr[Symbol.iterator]()
}

const processProfile = async ({ file }) => {
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
    profile: (obj, file) => processProfile(file),
    correlate: (obj, file) => processCorr(file)
  },
  Mutation: {
    singleUpload: (obj, { file }) => processUpload(file),
    delete: (obj, { path }) => processDelete(path)
  }
}
