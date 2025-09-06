import { ILocalActivity, ILocalActivityOptions } from '@/shared/typings';

export enum EStorageProperty {
  userId = 'userId',
  authToken = 'authToken',
}
export interface IClientApi {
  // getAllFields(): string[];

  getAppVersion(): string;

  // for electron read from electron store
  // for browser read from local storage
  getField(field: string): string;

  // save field/value to electron store or web local storage
  setField(field: string, value: string): string;

  clearStore(): void;

  getLocalActivitiesAndCount(
    options: ILocalActivityOptions,
  ): Promise<{ data: ILocalActivity[]; total: number }>;

  readLogChunk: (fileIndex: number, chunkIndex: number) => Promise<string>;

  platform(): string;
}
