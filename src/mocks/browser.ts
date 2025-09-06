import { setupWorker } from 'msw';
import { getHandlers } from './handlers';
const basePath = process.env.REACT_APP_LWS_SERVER_HOST;
// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...getHandlers(basePath));
