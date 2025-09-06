import React, { useState } from 'react';
import { Tabs } from 'antd';
import Overview from './_overview';
import LogPanel from 'components/logPanel';
import useWindowSize from 'hooks/useWindowSize';
import styles from './index.module.css';

const { TabPane } = Tabs;

enum ConsoleTab {
  Overview = 'Overview',
  Logs = 'Logs',
}

export default function Console() {
  const [activeKey, setActiveKey] = useState(ConsoleTab.Overview);
  // const navigate = useNavigate();
  const { windowSize } = useWindowSize();
  const containerHeight = windowSize.height - 44 - 62;

  // useEffect(() => {
  //   if () {
  //     navigate('/404');
  //   }
  // }, [navigate, currentPMS, currentIms]);

  const handleTabsChange = (key: string) => {
    setActiveKey(key as ConsoleTab);
  };

  return (
    <div className={styles.container}>
      <Tabs activeKey={activeKey} onChange={handleTabsChange}>
        <TabPane tab="Overview" key={ConsoleTab.Overview}>
          <Overview containerHeight={containerHeight} />
        </TabPane>
        <TabPane tab="Logs" key={ConsoleTab.Logs}>
          {activeKey === ConsoleTab.Logs ? <LogPanel containerHeight={containerHeight} /> : null}
        </TabPane>
      </Tabs>
    </div>
  );
}
