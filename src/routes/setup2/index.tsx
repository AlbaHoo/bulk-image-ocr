import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Login from './_login';

import styles from './index.module.css';


enum ECurrentStep {
  login = 0
}

export default function Setup2() {
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
        return <Login onNext={handleAfterLogin} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
}
