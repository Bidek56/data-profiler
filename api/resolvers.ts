import fs from 'fs'
import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import alasql from 'alasql'
import { parse } from 'csv-parse'
import {UserInputError} from 'apollo-server';
import { ApolloServerFileUploads } from 'ApolloServerFileUploads';

const num = require('jeezy').num
const arr = require('jeezy').arr

const UPLOAD_DIR = './uploads'
const db = lowdb(new FileSync('db.json'))

// Seed an empty DB.
db.defaults({ uploads: [] }).write()

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR)

interface StoreConfig {
  id: string
  path: string
  filename?: string
  mimetype?: string
}

const storeFS = ({
  stream,
  filename
}: {
  stream: fs.ReadStream
  filename: string
}): Promise<StoreConfig> => {
  const id: string = shortid.generate()
  const path: string = `${UPLOAD_DIR}/${id}-${filename}`

  const returned: StoreConfig = { id: id, path: path }

  return new Promise<StoreConfig>((resolve, reject) =>
    stream
      .on('error', error => {
        // console.error('stream.truncated')
        // if (stream.truncated)
        //   // Delete the truncated file.
        //   fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve(returned))
  )
}

const storeDB = (file: StoreConfig) => {
  const data: any = db.get('uploads')
  return data.push(file)
    .last()
    .write()
}

const deleteDB = (path: string) => {
  const data: any = db.get('uploads')
  return data.remove({ path: path }).write()
}

const processDelete = (path: string) => {
  fs.unlink(path, err => {
    if (err && err.code == 'ENOENT') new UserInputError('File not found', {invalidArgs: path})
    // console.error(`File ${path} not found`)
    else if (err) new UserInputError('Error occurred while trying to remove file', {invalidArgs: path})
    // else console.log(`File ${path} was removed`)
  })
  const res = deleteDB(path)

  // console.log("Del:", res)

  if (res.length) return res[0]
  else 
    throw new UserInputError('File not found', { invalidArgs: path })
}

const correlate = () => {
  try {
    var data = []
    // var cols = 'abcdefghijklmnopqrstuvwxyz'.split('')
    var cols = 'abcdefghij'.split('')
    for (var i: number = 0; i <= 2; i++) {
      var obj: any = { index: i }

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

const processCorr = async (file: string) => {
  const corr = correlate()

  // console.log("F:", file)

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

const processUpload = async (upload:ApolloServerFileUploads.Upload): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
  // console.log("upload:", upload)
  const { file } = upload;

  // console.log("filename:", file)
  const { createReadStream, filename, mimetype } = await file

  if (!createReadStream) 
    throw new UserInputError('Null read stream', { invalidArgs: filename })

  const stream: fs.ReadStream = <fs.ReadStream>createReadStream()
  const returned: StoreConfig = await storeFS({
    stream,
    filename
  })

  return storeDB({ id: returned.id, filename, mimetype, path: returned.path })
}

export type Maybe<T> = T | null

const processCsv = async (file: string): Promise<any[]> => {

  const csv_parser = parse({
    delimiter: ',',
    columns: true
  });

  let records = []
  const parser = fs
  .createReadStream(file)
  .pipe(csv_parser);

  // console.log(parser);
  for await (const record of parser) {
    // Work with each record
    records.push(record)
  }
  return records
}

const processProfile = async (file: string): Promise<any[]> => {

  if (file.endsWith('.xlsx')) {
    let res = await alasql.promise(
      `select Segment as att1, Country as att2, SUM(Sales) as val from xlsx('${file}') group by Segment,Country`
    )
    return res[Symbol.iterator]()
  } else if (file.endsWith('.csv')) {
    // console.log("CSV:", file);

    const ret = processCsv(file);

    // const ret: any[] = [];
    return ret;
  }
  else
    throw new UserInputError('Uknown file type', { invalidArgs: file })
}

const getColumns = async (file: string): Promise<string[]> => {
  if (file.endsWith('.csv')) {
    // console.log(file);

    const ret2 = await processCsv(file);
    if (ret2.length > 0) {
      const keys = Object.keys(ret2[0]);
      // console.log(keys)
      return keys; // return list of columns
    } else
      throw new UserInputError('Error parsing', { invalidArgs: file })  
  }
  else
    throw new UserInputError('Uknown file type', { invalidArgs: file })
}

export const Query = {
  uploads: () => db.get('uploads').value(),
  profile: (obj: any, { file }: { file: string }) => processProfile(file),
  columns: (obj: any, { file }: { file: string }) => getColumns(file),
  correlate: (obj: any, file: string) => processCorr(file)
}

export const Mutation = {
  singleUpload: (parent: any, { file }: { file: ApolloServerFileUploads.Upload }): Promise<ApolloServerFileUploads.UploadedFileResponse> => processUpload(file),
  delete: (obj: any, { path }: { path: string }) => processDelete(path)
}
