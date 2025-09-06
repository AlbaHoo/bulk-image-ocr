import React from 'react';
import { Modal } from 'antd';
import LoginView from './loginView';
import { ModalProps } from 'antd/lib/modal';

interface IPropTypes extends ModalProps {
  title: string;
  onLoginSuccess: () => void;
}

export default function LoginModal(props: IPropTypes) {
  const { title, onLoginSuccess, ...rest } = props;
  return (
    <Modal
      {...rest}
      destroyOnClose={true}
      title={null}
      footer={null}
      bodyStyle={{ paddingTop: 44 }}
    >
      {<LoginView title={title} onLoginSuccess={onLoginSuccess} />}
    </Modal>
  );
}
