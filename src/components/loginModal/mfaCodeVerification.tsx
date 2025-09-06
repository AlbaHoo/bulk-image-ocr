import React, { FormEventHandler, useCallback, useMemo, useRef } from 'react';
import { Space, Form, Button, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import RecaptchaSubmitButton, { IRecaptchaSubmitButtonRef } from '@/components/recaptchaSubmitButton';
import ExplicitRecaptcha, { IExplicitRecaptchaRef } from '@/components/explicitRecaptcha';
import CountdownText from '@/components/countdownText';

interface IPropTypes {
  secondaryAction?: any;
  showExplicitRecaptcha?: boolean;
  submitButtonText?: string;
  isSubmitting?: boolean;
  isResending?: boolean;
  mfaMobileNumber: string;
  mfaCodeResendNextAvailableTime: Date;
  mfaCodeResendAvailable: boolean;
  // the submit callback will need to return true or false to indicate the verification result
  // we will use this result to decide if we need to reset the recaptcha
  onSubmit: (code: string) => Promise<boolean>;
  onResend?: (recaptchaToken: string) => Promise<boolean>;
}

export default function MfaCodeVerification(props: IPropTypes) {
  const {
    showExplicitRecaptcha,
    mfaMobileNumber,
    submitButtonText,
    isSubmitting,
    isResending,
    onSubmit,
    onResend,
    mfaCodeResendNextAvailableTime,
    mfaCodeResendAvailable,
  } = props;
  const verifyButtonRef = useRef<IRecaptchaSubmitButtonRef>();
  const resendButtonRef = useRef<IRecaptchaSubmitButtonRef>();
  const explicitRecaptchaRef = useRef<IExplicitRecaptchaRef>();

  const handleResendVerificationCode = useCallback<FormEventHandler>(
    async (e) => {
      e.preventDefault();
      if (onResend) {
        let recaptchaToken: string;
        if (showExplicitRecaptcha) {
          recaptchaToken = explicitRecaptchaRef.current?.verify();
          if (!recaptchaToken) {
            message.error('reCAPTCHA is not resolved');
          }
        } else {
          recaptchaToken = await resendButtonRef.current?.recaptchaVerify();
        }
        if (recaptchaToken) {
          await onResend(recaptchaToken);
          if (showExplicitRecaptcha) {
            explicitRecaptchaRef.current?.reset();
          }
        }
      }
    },
    [showExplicitRecaptcha, onResend],
  );

  const handleFormSubmit = useCallback(
    async (values) => {
      if (onSubmit) {
        let recaptchaToken: string;
        if (showExplicitRecaptcha) {
          recaptchaToken = explicitRecaptchaRef.current?.verify();
          if (!recaptchaToken) {
            message.error('reCAPTCHA is not resolved');
          }
        } else {
          recaptchaToken = await verifyButtonRef.current?.recaptchaVerify();
        }
        if (recaptchaToken) {
          // recaptchaToken is actually not needed for backend API for MFA code verification
          const verifyResult = await onSubmit(values.code);
          // only reset if the verification is a failure
          if (!verifyResult && showExplicitRecaptcha) {
            explicitRecaptchaRef.current?.reset();
          }
        }
      }
    },
    [showExplicitRecaptcha, onSubmit],
  );

  const verifierButtonLabel = useMemo(() => submitButtonText || 'Verify', [submitButtonText]);
  return (
    <div>
      <Form onFinish={handleFormSubmit}>
        <Form.Item
          name="code"
          rules={[{ required: true, message: 'Please input the verification code' }]}
          label="Verification code"
          help={
            <div>
              A verification code has been sent to your mobile number {mfaMobileNumber}.{' '}
              {!mfaCodeResendAvailable && mfaCodeResendNextAvailableTime ? (
                <span>
                  You can resend in{' '}
                  <CountdownText
                    type="secondary"
                    key={mfaCodeResendNextAvailableTime.getTime()}
                    deadline={mfaCodeResendNextAvailableTime}
                  />
                </span>
              ) : null}
            </div>
          }
        >
          <Input
            disabled={isSubmitting || isResending}
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="123456"
          />
        </Form.Item>
        {showExplicitRecaptcha ? <ExplicitRecaptcha ref={explicitRecaptchaRef} /> : null}
        <Space style={{ marginTop: 20 }}>
          {showExplicitRecaptcha ? (
            <Button
              onClick={handleResendVerificationCode}
              loading={isResending}
              disabled={!mfaCodeResendAvailable || isResending || isSubmitting}
            >
              Resend
            </Button>
          ) : (
            <RecaptchaSubmitButton
              ref={resendButtonRef}
              onClick={handleResendVerificationCode}
              loading={isResending}
              disabled={!mfaCodeResendAvailable || isResending || isSubmitting}
            >
              Resend
            </RecaptchaSubmitButton>
          )}
          {showExplicitRecaptcha ? (
            <Button
              htmlType="submit"
              type="primary"
              loading={isSubmitting}
              disabled={isResending || isSubmitting}
            >
              {verifierButtonLabel}
            </Button>
          ) : (
            <RecaptchaSubmitButton
              ref={verifyButtonRef}
              htmlType="submit"
              type="primary"
              loading={isSubmitting}
              disabled={isResending || isSubmitting}
            >
              {verifierButtonLabel}
            </RecaptchaSubmitButton>
          )}
        </Space>
      </Form>
    </div>
  );
}
