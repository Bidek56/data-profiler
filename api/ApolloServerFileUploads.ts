import { ReadStream } from 'fs';

export namespace ApolloServerFileUploads {
  export type File = {
    createReadStream()?: ReadStream;
    filename: string;
    mimetype: string;   
  };

  export type UploadedFileResponse = {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
  };

  export interface IUploader {
    singleFileUploadResolver: (
      parent: any,
      { file }: { file: File }
    ) => Promise<UploadedFileResponse>;
    multipleUploadsResolver: (
      parent: any,
      { files }: { files: File[] }
    ) => Promise<UploadedFileResponse[]>;
  }
}
