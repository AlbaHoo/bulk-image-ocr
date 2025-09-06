import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import GlobalProvider from './Context';
import App from './App';

test('render without crashing', () => {
  render(
    <BrowserRouter>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </BrowserRouter>,
  );
});
