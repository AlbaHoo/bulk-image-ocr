import Parse from 'parse';

interface IBase {
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export enum EMediaType {
  png = 'png',
  jpeg = 'jpeg',
}

export interface IMediaAttr extends IBase {
  name: string;
  hash: string;
  type: EMediaType;
  file?: Parse.File; // Add the file property as Parse.File
}

export interface IMediaFilter {
  startAt?: Date;
  endAt?: Date;
}

export class MediaHash extends Parse.Object<IMediaAttr> {
  constructor(attributes: IMediaAttr) {
    super('MediaHash', attributes);
  }
}
