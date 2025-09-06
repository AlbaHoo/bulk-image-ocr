import React, { useCallback } from 'react';
import { Button, Form, Input, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

interface IPropTypes {
  secondaryAction?: any;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onSubmit: (values: { email?: string; password: string }) => Promise<boolean>;
}

export default function SignupWithEmailView(props: IPropTypes) {
  const { onSubmit, isSubmitting, secondaryAction, submitButtonText } = props;

  const handleFormSubmit = useCallback(
    async (values) => {
      if (onSubmit) {
        await onSubmit(values);
      }
    },
    [onSubmit],
  );

  return (
    <Form style={{ width: 255, margin: 'auto' }} onFinish={handleFormSubmit}>
      <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
        <Input
          prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="email"
          disabled={isSubmitting}
          type="email"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="password"
          disabled={isSubmitting}
          type="password"
        />
      </Form.Item>
      <Form.Item>
        <Space>
          {secondaryAction ? secondaryAction : null}
          <Button htmlType="submit" type="primary" loading={isSubmitting}>
            {submitButtonText || 'Signup'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
