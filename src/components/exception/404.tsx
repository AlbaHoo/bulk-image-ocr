import React from 'react';
import { useNavigate } from 'react-router';
import { Result, Button } from 'antd';

export default function Exception404() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<Button type="primary" onClick={() => navigate('/')}>Back Home</Button>}
    />
  );
}
