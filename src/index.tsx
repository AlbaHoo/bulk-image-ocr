import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import GlobalProvider from './Context';
import App from './App';
import Bridge from './routes/bridge';
import Exception404 from 'components/exception/404';
import reportWebVitals from './reportWebVitals';

import './index.css';
import Setup from 'routes/setup';
import { overrideConsoleLogWithWinston } from 'utils/logger';
import Signup from 'routes/signup';
import Verification from 'routes/verification';
import Setup2 from 'routes/setup2';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

overrideConsoleLogWithWinston();

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  environment: process.env.REACT_APP_SENTRY_ENV,
  tracesSampleRate: 1.0,
});

let basename;
if (window.location.protocol.includes('file')) {
  basename = window.location.pathname.replace(/\/build\/.*/, '/build/');
}

if (process.env.REACT_APP_RUNTIME_ENV === 'testing') {
  const { worker } = require('./mocks/browser');
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}

// if (!isElectron()) {

// } else {
//   (window as any).lwsClientAPI = lwsClientAPI;
// }

root.render(
  <BrowserRouter basename={basename}>
    <GlobalProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Bridge />} />
          <Route path="index.html" element={<Bridge />} />
          <Route path="login" element={<Setup />} />
          <Route path="signup" element={<Signup />} />
          <Route path="home" element={<Verification />} />
          <Route path="login2" element={<Setup2 />} />
          <Route path="*" element={<Exception404 />} />
        </Route>
      </Routes>
    </GlobalProvider>
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
