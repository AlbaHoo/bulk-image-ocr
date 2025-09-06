import { BrowserClientApi } from 'clientApiWeb';

export class AndroidClientApi extends BrowserClientApi {
  platform(): string {
    return 'android';
  }
}

const single = new AndroidClientApi();

export default single;
