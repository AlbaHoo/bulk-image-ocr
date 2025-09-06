import React, { useState } from 'react';
import { Tabs } from 'antd';
import ImageViewer from './_imageViewer';
import LogPanel from 'components/logPanel';
import useWindowSize from 'hooks/useWindowSize';
import styles from './index.module.css';
import Verify from './_verify';
import withAuth from 'hoc/withAuth';
import VerifiedList from './_verifiedList';

const { TabPane } = Tabs;

enum VerificationTab {
  Creation = 'Creation',
  Verification = 'Verification',
  MyImages = 'MyImages',
}

function Verification() {
  const [activeKey, setActiveKey] = useState(VerificationTab.Creation);
  // const navigate = useNavigate();
  const { windowSize } = useWindowSize();
  const containerHeight = windowSize.height - 44 - 62;

  const handleTabsChange = (key: string) => {
    setActiveKey(key as VerificationTab);
  };

  return (
    <div className={styles.container}>
      <Tabs destroyInactiveTabPane activeKey={activeKey} onChange={handleTabsChange}>
        <TabPane tab="Creation" key={VerificationTab.Creation}>
          <ImageViewer containerHeight={containerHeight} />
        </TabPane>
        <TabPane tab="Verification" key={VerificationTab.Verification}>
          <Verify containerHeight={containerHeight} />
        </TabPane>
        <TabPane tab="My Images" key={VerificationTab.MyImages}>
          <VerifiedList containerHeight={containerHeight} />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default withAuth(Verification);
