import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, message, Modal } from 'antd';
import './App.css';
import { lwsClientAPI } from '@/platforms';

const { Text } = Typography;

export default function App() {
  const location = useLocation();
  const appVersion = lwsClientAPI?.getAppVersion() || '';
  const navigate = useNavigate();
  const isConsolePage = location.pathname.includes('/home');

  const onDeauthorise = async () => {
    try {
      lwsClientAPI.clearStore();
      navigate('/login');
    } catch (error: any) {
      const errMsg = `Client self deauthorise failed: ${error.message}`;
      message.error(errMsg);
      // if fail, we still want to clear local storage
      lwsClientAPI.clearStore();
      navigate('/login');
      return Promise.reject(errMsg);
    }
  };

  const confirmDeauthorise = () => {
    Modal.confirm({
      title: 'Are you sure you want to de-authorise this client?',
      okText: 'Deauthorise',
      cancelText: 'Cancel',
      onOk: onDeauthorise,
    });
  };

  return (
    <div className="App-container">
      <main className="App-content">
        <Outlet />
      </main>
      <footer className="App-footer">
        <div className="App-version" style={{ flexGrow: isConsolePage ? 0 : 1 }}>
          <Text type="secondary">
            version {appVersion} | {process.env.REACT_APP_RUNTIME_ENV} |{' '}
            {lwsClientAPI?.platform() || 'web'} |{' '}
          </Text>
          {/* <Button type="link" onClick={() => openBeacon('/ask/')}>
            Report Issue
          </Button> */}
        </div>
        {isConsolePage ? (
          <Button danger type="link" onClick={confirmDeauthorise}>
            Logout
          </Button>
        ) : null}
      </footer>
    </div>
  );
}
