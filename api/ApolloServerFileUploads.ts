import { ReadStream } from 'fs';

export namespace ApolloServerFileUploads {
  export type Upload = {
    createReadStream(): ReadStream;
    filename: string;
    mimetype: string;
    encoding: string;
  };

  export type UploadedFileResponse = {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
  };

  export interface IUploader {
    singleFileUploadResolver: (parent: any, { file }: { file: Upload } ) => Promise<UploadedFileResponse>;
  }
}
