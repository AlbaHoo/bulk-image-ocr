import React, { useState, useEffect, useContext } from 'react';
import { Typography, Space, Alert, Button, Table, Tag, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import * as Sentry from '@sentry/browser';
import FullScreenLoading from 'components/fullScreenLoading';
import LoginModal from 'components/loginModal';
import { GlobalContext } from '../../Context';
import {
  EIMType,
  IItemsAndCount,
  ILocalActivity,
  EAgentStatus,
  ELocalActivityStatus,
} from 'shared/typings';
import { getIMOptionLabel, getErrorPMSType, getErrorIMTypes } from 'shared/config';
import { formatToDateTimeStr } from 'shared/utils';
import { upperFirstLetter } from 'utils';
import styles from './index.module.css';
import { lwsClientAPI } from 'platforms';

const { Title, Text } = Typography;

const columns = [
  {
    title: 'Timestamp',
    dataIndex: 'createdAt',
    width: 180,
    render: (createdAt: Date) => formatToDateTimeStr(createdAt),
  },
  {
    title: 'Result',
    dataIndex: 'status',
    width: 100,
    render: (status: ELocalActivityStatus) => <Tag color={status}>{upperFirstLetter(status)}</Tag>,
  },
  {
    title: 'Details',
    key: 'dataToSync',
    render: (record: ILocalActivity) =>
      record.status === ELocalActivityStatus.error ? record.syncError : JSON.stringify(record.dataToSync) || '-',
  },
];
const PAGE_SIZE = 10;

interface IPropTypes {
  containerHeight: number;
}

export default function Overview(props: IPropTypes) {
  const [practiceName, setPracticeName] = useState<string>('test name');
  const [mountLoading, setMountLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [current, setCurrent] = useState(1); // default first page
  const [localActivities, setLocalActivities] = useState<IItemsAndCount<ILocalActivity>>(null);
  const [lastLocalActivity, setLastLocalActivity] = useState<ILocalActivity>(null);
  const lastSyncStartedAt = lastLocalActivity?.syncStartedAt;
  const lastSyncStatus = lastLocalActivity?.status;
  const { agentStatus, socketConnected, lastCheckError, localActivityUpdatedAt, setAgentStatus } =
    useContext(GlobalContext);
  const errorPMSType = getErrorPMSType(lastCheckError);
  const errorIMTypes = getErrorIMTypes(lastCheckError);

  const practiceId = 'test client id'

  const handleHealthChecks = async () => {
    setChecking(true);
    try {
      console.log('test');
    } catch (e: any) {
      const errMsg = `Health check error on mount overview page: ${e.message}`;
      console.error(errMsg);
      Sentry.captureException(errMsg);
    }
    setChecking(false);
  };

  const loadMountInfo = async () => {
    setMountLoading(true);
    try {
      await loadLocalActivities(1);
      setPracticeName('home page');
      await handleHealthChecks();
      // lwsClientAPI.healthChecksInterval();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setAgentStatus(EAgentStatus.unauthorised);
      }
      const errMsg = `Load overview tab mount info error: ${err.message}`;
      console.error(errMsg);
      Sentry.captureException(errMsg);
    }
    setMountLoading(false);
  };

  const loadLocalActivities = async (page: number) => {
    setLoading(true);
    setCurrent(page);
    try {
      const result = await lwsClientAPI.getLocalActivitiesAndCount({
        page: page - 1,
        pageSize: PAGE_SIZE,
      });
      setLocalActivities(result);
      console.log(result);
      if (page === 1) {
        setLastLocalActivity(result.data[0]);
      }
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errMsg = `Load local activities error: ${err.message}`;
      console.error(errMsg);
      message.error(err.message);
      Sentry.captureException(errMsg);
    }
  };

  useEffect(() => {
    loadMountInfo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update local activities list
  useEffect(() => {
    if (localActivityUpdatedAt) {
      loadLocalActivities(1);
    }
  }, [localActivityUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReauthorise = () => {
    setLoginModalVisible(true);
  };

  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
    loadMountInfo();
  };

  const renderAccessDeniedMessage = () => {
    const errorMsgs = [];
    if (errorPMSType) {
      errorMsgs.push('PMS');
    }
    if (errorIMTypes?.length) {
      errorMsgs.push('Imaging Software');
    }
    return errorMsgs.length
      ? `Desktop APP Client can not connect to your ${errorMsgs.join(' and ')}`
      : '';
  };

  const renderAccessDeniedDesc = () => {
    let errorMsgs = lastCheckError?.split(', ') || [];
    if (errorIMTypes?.includes(EIMType.romexis)) {
      errorMsgs = errorMsgs.filter((msg) => !msg.includes(getIMOptionLabel(EIMType.romexis)));
      errorMsgs.push(
        'Can not connect to your Romexis server, make sure your Romexis setting is correct and Romexis server is running',
      );
    }
    return errorMsgs.length ? errorMsgs.join('. ') : '';
  };

  const renderAgentStatusException = () => {
    switch (agentStatus) {
      case EAgentStatus.unauthorised:
        return (
          <Alert
            message="CoTreat server access is removed"
            description="You might have deauthorised Desktop APP Client from CoTreat web app."
            showIcon
            type="warning"
            action={
              <Button type="primary" size="small" onClick={handleReauthorise}>
                Re-authorise
              </Button>
            }
          />
        );
      case EAgentStatus.pmsAccessDenied:
        return (
          <Alert
            message={renderAccessDeniedMessage()}
            description={renderAccessDeniedDesc()}
            showIcon
            type="warning"
            action={
              <Button type="primary" size="small" loading={checking} onClick={handleHealthChecks}>
                Try again
              </Button>
            }
          />
        );
      default:
        break;
    }
  };

  const paginationConfig = {
    current,
    pageSize: PAGE_SIZE,
    hideOnSinglePage: true,
    total: localActivities?.total,
    onChange: (newPage: number) => {
      loadLocalActivities(newPage);
    },
  };

  if (mountLoading) {
    return <FullScreenLoading />;
  }

  return (
    <Space
      className={styles.overview}
      style={{ height: props.containerHeight }}
      direction="vertical"
      size={20}
    >
      <Space size="large">
        <Title style={{ marginBottom: 0 }} level={5}>
          {practiceName}
        </Title>
        {lastSyncStartedAt ? (
          <Alert
            showIcon
            icon={
              lastSyncStatus === ELocalActivityStatus.processing ? (
                <SyncOutlined spin style={{ color: '#1890ff' }} />
              ) : null
            }
            style={{ padding: 0, border: 'none', backgroundColor: '#fff' }}
            type={
              agentStatus !== EAgentStatus.operational || !socketConnected
                ? 'info'
                : lastSyncStatus === ELocalActivityStatus.success
                ? 'success'
                : 'error'
            }
            message={
              <Text type="secondary">
                {lastSyncStatus === ELocalActivityStatus.processing
                  ? `Data syncing in progress... (started at ${formatToDateTimeStr(
                      lastSyncStartedAt,
                    )})`
                  : `Last Synced at ${formatToDateTimeStr(lastSyncStartedAt)}`}
              </Text>
            }
          />
        ) : null}
      </Space>
      {renderAgentStatusException()}
      {localActivities?.total > 0 ? (
        <Table
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={localActivities?.data}
          columns={columns}
          pagination={paginationConfig}
        />
      ) : null}
      <LoginModal
        title="Desktop APP Client Login"
        visible={loginModalVisible}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setLoginModalVisible(false)}
      />
    </Space>
  );
}
