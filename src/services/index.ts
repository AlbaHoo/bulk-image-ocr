import { MockUserService } from './mock-user.service';
import { UserService } from './user.service';
import { MockMediaService } from './mock-media.service';
import { MediaService } from './media.service';

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

export const Apis = {
  getUserApi: getUserServiceApi,
  getMediaApi,
};
