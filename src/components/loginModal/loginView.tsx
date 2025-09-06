import React from 'react';
import { Typography } from 'antd';
import useAuthCheck from '@/hooks/useAuthCheck';
import LoginWithEmailView from './loginWithEmailView';
import { Apis } from '@/services';
import styles from './index.module.css';
import { lwsClientAPI } from '@/platforms';

const { Title, Text } = Typography;

interface IPropTypes {
  title: string;
  onLoginSuccess: () => void;
}

export default function Login(props: IPropTypes) {
  const handleLoginSuccess = async ({ idToken }) => {
    lwsClientAPI.setField('authToken', idToken);
    props.onLoginSuccess();
  };

  const { isCheckingPassword, checkPassword } = useAuthCheck({
    onCheckPassword: async (password, email) => {
      const user = await Apis.getUserApi().login(email, password);
      return { idToken: user.sessionToken };
    },
    onAuthCheckSuccess: handleLoginSuccess,
  });

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 30 }}>
        <Title level={3} style={{ marginBottom: 10 }}>
          {props.title}
        </Title>
        <Text type="secondary">Log in with your account to continue</Text>
      </div>
      <LoginWithEmailView
        onSubmit={(values) => checkPassword(values.password, values.email)}
        isSubmitting={isCheckingPassword}
      />
    </div>
  );
}
