import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import useAuthCheck from 'hooks/useAuthCheck';
import { Apis } from 'services';
import styles from './index.module.css';
import { lwsClientAPI } from 'platforms';
import SignupWithEmailView from './_signupWithEmailView';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface IPropTypes {
  title: string;
  onLoginSuccess: () => void;
}

export default function Signup(props: IPropTypes) {
  const navigator = useNavigate();
  const handleLoginSuccess = async ({ idToken }) => {
    // const { integrationToken, practiceId } = await authorizeAgent(cotreatAgentId);
    lwsClientAPI.setField('authToken', idToken);
    props.onLoginSuccess();
  };

  const { isCheckingPassword, checkPassword } = useAuthCheck({
    onCheckPassword: async (password, email) => {
      const user = await Apis.getUserApi().signup(email, password);
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
        <Text type="secondary">Signup to continue</Text>
      </div>
      <SignupWithEmailView
        onSubmit={(values) => checkPassword(values.password, values.email)}
        isSubmitting={isCheckingPassword}
      />
      <Button type="link" onClick={() => navigator('/login')}>
        Already have an account? Login
      </Button>
    </div>
  );
}
