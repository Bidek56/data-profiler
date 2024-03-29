import { ReadStream } from 'fs';

export namespace ApolloServerFileUploads {
  export type File = {
    createReadStream(): ReadStream;
    filename: string;
    mimetype: string;
    encoding: string;
  };

  export type UploadedFileResponse = {
    id: string;
    filename: string;
    mimetype: string;
    path: string;
    encoding?: string;
  };

  export type Upload = {
    file: File;
  }

  export interface IUploader {
    singleFileUploadResolver: (parent: any, { file }: { file: Upload } ) => Promise<UploadedFileResponse>;
  }
}
