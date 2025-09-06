export interface IMedia {
  name?: string;
  hash: string;
  id: string;
  fileUrl?: string;
}

export interface IMediaService {
  createHash(md5: string, base64: string, fileName?: string): Promise<IMedia>;
  verifyHash(md5: string): Promise<IMedia>;
  getMediaList({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }): Promise<IMedia[]>;
  deleteHash(id: string): Promise<void>;
  getMedia(id: string): Promise<string>;
}
