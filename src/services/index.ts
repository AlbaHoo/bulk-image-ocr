import { MockUserService } from './mock-user.service';
import { UserService } from './user.service';
import { MockMediaService } from './mock-media.service';
import { MediaService } from './media.service';
import { MockImageListService } from './mock-image-list.service';
import { ImageListService } from './image-list.service';
import { MockImageItemService } from './mock-image-item.service';
import { ImageItemService } from './image-item.service';
import { MockOcrService } from './mock-ocr.service';
import { OcrService } from './ocr.service';

const BASE_PATH = 'http://localhost'.replace(/\/+$/, '');

const enableMock = false;

const getUserServiceApi = () => {
  if (enableMock) {
    return new MockUserService();
  } else {
    return new UserService();
  }
};

const getMediaApi = () => {
  if (enableMock) {
    return new MockMediaService();
  } else {
    return new MediaService();
  }
};

const getImageListApi = () => {
  if (enableMock) {
    return new MockImageListService();
  } else {
    return new ImageListService();
  }
};

const getImageItemApi = () => {
  if (enableMock) {
    return new MockImageItemService();
  } else {
    return new ImageItemService();
  }
};

const getOcrApi = () => {
  if (enableMock) {
    return new MockOcrService();
  } else {
    return new OcrService();
  }
};

export const Apis = {
  getUserApi: getUserServiceApi,
  getMediaApi,
  getImageListApi,
  getImageItemApi,
  getOcrApi,
};
