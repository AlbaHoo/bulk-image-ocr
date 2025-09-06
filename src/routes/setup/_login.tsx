import React from 'react';
import LoginView from '@/components/loginModal/loginView';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface IPropTypes {
  onNext: () => void;
}

export default function Login(props: IPropTypes) {
  const navigator = useNavigate();
  return (
    <div>
      <LoginView title="Client Setup" onLoginSuccess={props.onNext} />
      <Button type="link" onClick={() => navigator('/signup')}>
        Don't have an account? Sign up
      </Button>
    </div>
  );
}
