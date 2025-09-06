import { EMediaType } from 'typings/media';
import { IMedia, IMediaService } from './media.interface';
import {
  createMediaHash,
  deleteMediaHash,
  getMediaHashAndCount,
  getMediaHashById,
  getMediaHashByMd5,
} from './parse-server';

export class MediaService implements IMediaService {
  async createHash(md5: string, base64: string, fileName?: string): Promise<IMedia> {
    // Implement your login logic here
    // For example, you might check the email and password against a database
    // and return the user if the credentials are valid
    const media = await createMediaHash({
      type: EMediaType.png,
      hash: md5,
      fileData: { base64 },
      fileName,
    });
    return {
      hash: md5,
      id: media.id,
    };
  }

  async verifyHash(md5: string): Promise<IMedia> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    const media = await getMediaHashByMd5(md5);
    if (media) {
      return {
        hash: md5,
        id: media.id,
        fileUrl: media.get('file')?.url(),
      };
    }
    return null;
  }

  async getMediaList({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }): Promise<IMedia[]> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    const mediaList = await getMediaHashAndCount(pageIndex, pageSize);
    console.log(mediaList);
    return mediaList.map((media) => ({
      hash: media.get('hash'),
      id: media.id,
      fileUrl: media.get('file')?.url(),
    }));
  }

  async deleteHash(id: string): Promise<void> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    await deleteMediaHash(id);
  }

  async getMedia(id: string): Promise<string> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    const media = await getMediaHashById(id);
    const file = media.get('file');
    if (file) {
      return file.url();
    }
    return null;
  }
}
