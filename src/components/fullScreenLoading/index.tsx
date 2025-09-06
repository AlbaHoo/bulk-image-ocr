import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './index.module.css';

export default function FullScreenLoading() {
  return (
    <div className={styles.container}>
      <LoadingOutlined />
    </div>
  );
}
