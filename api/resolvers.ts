
import fs from 'fs'
import shortid from 'shortid'
import mkdirp from 'mkdirp'
import alasql from 'alasql'
import { parse } from 'csv-parse'
import { GraphQLError } from 'graphql';
import { ApolloServerFileUploads } from './ApolloServerFileUploads';
import { initJSONDatabase } from './db'

interface StoreConfig {
    id: string
    path: string
    filename?: string
    mimetype?: string
}

// db data
type Data = {
    uploads: StoreConfig[]
}

const defaultState: Data = {
    uploads: []
};

const db = initJSONDatabase(defaultState);
const data = await db.read();

const UPLOAD_DIR = './uploads'

// console.log(data);

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR)

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

const storeDB = async (file: StoreConfig) => {
    data?.uploads.push(file)
    await db.write(data)
}

const deleteDB = async (path: string) => {
    if (data) {
        const found = data.uploads.filter(store => store.path === path)
        data.uploads = data.uploads.filter(store => store.path !== path)
        await db.write(data)

        return found
    }
    return null
}

const processDelete = async (path: string) => {
    fs.unlink(path, err => {
        if (err && err.code == 'ENOENT') 
            new GraphQLError('Uknown file type', { extensions: { code: 'BAD_USER_INPUT' }} )
        // console.error(`File ${path} not found`)
        else if (err) 
            new GraphQLError('Error occurred while trying to remove file', { extensions: { code: 'BAD_USER_INPUT' }} )
        // else console.log(`File ${path} was removed`)
    })
    const res = await deleteDB(path)

    // console.log("Del:", res)

    if (res?.length) return res[0]
    else
        return new GraphQLError('File not found', { extensions: { code: 'BAD_USER_INPUT' }} )
}

const randomIntFromInterval = (min: number, max: number) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const correlate = () => {
    try {
        var data = []
        // var cols = 'abcdefghijklmnopqrstuvwxyz'.split('')
        var cols = 'abcdefghij'.split('')
        for (var i: number = 0; i <= 2; i++) {
            var obj: any = { index: i }

            cols.forEach(col => {
                obj[col] = randomIntFromInterval(1, 100)
            })
            data.push(obj)
        }

        // console.log('data:', data)

        // const corr = arr.correlationMatrix(data, cols)
        // console.log('Corr len:', corr.length)

        return data
    } catch (ex) {
        console.error(ex)
    }

    return null
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

    return corr
}

const processUpload = async (upload: ApolloServerFileUploads.Upload): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
    // console.log("upload:", upload)
    const { file } = upload;

    // console.log("filename:", file)
    const { createReadStream, filename, mimetype } = file

    if (!createReadStream)
        throw new GraphQLError('Null read stream', { extensions: { code: 'BAD_USER_INPUT' }} )

    const stream: fs.ReadStream = <fs.ReadStream>createReadStream()
    const returned: StoreConfig = await storeFS({
        stream,
        filename
    })

    storeDB({ id: returned.id, filename, mimetype, path: returned.path })

    return { id: returned.id, filename, mimetype, path: returned.path }
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
      throw new GraphQLError('Uknown file type', { extensions: { code: 'BAD_USER_INPUT' }} )
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
        throw new GraphQLError('Error parsing', { extensions: { code: 'BAD_USER_INPUT' }} )
    }
    else
      throw new GraphQLError('Uknown file type', { extensions: { code: 'BAD_USER_INPUT' }} )
  }
  
  export const Query = {
    uploads: () => data.uploads,
    profile: (obj: any, { file }: { file: string }) => processProfile(file),
    columns: (obj: any, { file }: { file: string }) => getColumns(file),
    correlate: (obj: any, file: string) => processCorr(file)
  }
  
  export const Mutation = {
    singleUpload: (parent: any, { file }: { file: ApolloServerFileUploads.Upload }): Promise<ApolloServerFileUploads.UploadedFileResponse> => processUpload(file),
    delete: (obj: any, { path }: { path: string }) => processDelete(path)
  }
  