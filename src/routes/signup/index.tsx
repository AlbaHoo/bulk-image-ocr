import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Steps } from 'antd';
import Signup from './_signup';

import styles from './index.module.css';

const { Step } = Steps;

enum ECurrentStep {
  login = 0
}

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const searchParamStep = Object.keys(ECurrentStep).find((key) => key === searchParams.get('step'));
  const defaultStep = searchParamStep ? ECurrentStep[searchParamStep] : ECurrentStep.login;
  console.log('defaultStep', defaultStep);
  const [currentStep, setCurrentStep] = useState<ECurrentStep>(ECurrentStep.login);
  const navigate = useNavigate();

  const handleAfterLogin = () => {
    navigate('/home');
  };

  const renderContent = () => {
    switch (currentStep) {
      case ECurrentStep.login:
        return <Signup title="Client Signup" onLoginSuccess={handleAfterLogin} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Steps className={styles.steps_container} current={currentStep}>
        <Step title="Signup" />
        {/* <Step title="Config Settings" />
        // <Step title="Start Monitor" /> */}
      </Steps>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
}
