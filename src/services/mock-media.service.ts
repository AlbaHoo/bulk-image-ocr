import { IMedia, IMediaService } from './media.interface';

export class MockMediaService implements IMediaService {
  async createHash(md5: string, base64: string, fileName?: string): Promise<IMedia> {
    // Implement your login logic here
    // For example, you might check the email and password against a database
    // and return the user if the credentials are valid
    const media: IMedia = {
      hash: 'hash',
      name: 'John Doe',
      id: '123',
    };
    return media;
  }

  async verifyHash(md5: string): Promise<IMedia> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    const media: IMedia = {
      hash: 'hash',
      name: 'John Doe',
      id: '123',
    };
    return media;
  }

  async getMediaList({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }): Promise<IMedia[]> {
    console.log(pageIndex, pageSize);
    const media: IMedia = {
      hash: 'hash',
      name: 'John Doe',
      id: '123',
    };
    const media2: IMedia = {
      hash: 'hash',
      name: 'Green',
      id: '124',
    };
    return [media, media2];
  }

  async deleteHash(id: string): Promise<void> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    return;
  }

  async getMedia(id: string): Promise<string> {
    return 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg';
  }
}
