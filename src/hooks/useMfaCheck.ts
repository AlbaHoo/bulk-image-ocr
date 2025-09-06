import { useCallback, useEffect, useState } from 'react';
import { EAPIFunctionErrorTypes } from 'typings/error';
import { APIFunctionError } from 'utils/error';
import { message } from 'antd';

export default function useMfaCheck<SUCCESS_RESULT>(options: {
  onResendMfaCode(
    recaptchaToken: string,
    mfaMobileNumber: string,
  ): Promise<{ phoneSessionInfo: string }>;
  onVerifyMfaCode(phoneSessionInfo: string, mfaCode: string): Promise<SUCCESS_RESULT>;
  onMfaCheckSuccess(result: SUCCESS_RESULT): Promise<void>;
  onResendMfaCodeSuccess?(): void;
}) {
  const [isCheckingMfaCode, setIsCheckingMfaCode] = useState(false);
  const [isResendingMfaCode, setIsResendingMfaCode] = useState(false);
  const [mfaCheckError, setMfaCheckError] = useState<APIFunctionError | unknown>();
  const [requireExplicitRecaptcha, setRequireExplicitRecaptcha] = useState(false);
  const [mfaCodeResendNextAvailableTime, setMfaCodeNextResendAvailableTime] = useState<Date>();
  const [mfaCodeResendAvailable, setMfaCodeResendAvailable] = useState(true);
  const [phoneSessionInfo, _setPhoneSessionInfo] = useState<string>();
  // this can be the masked number from login
  // or the actual mobile number for Mfa Setup
  const [mfaMobileNumber, setMfaMobileNumber] = useState<string>();

  const reset = useCallback(() => {
    setIsCheckingMfaCode(false);
    setIsResendingMfaCode(false);
    setMfaCheckError(null);
    setRequireExplicitRecaptcha(false);
    _setPhoneSessionInfo(null);
    setMfaCodeNextResendAvailableTime(null);
  }, []);

  const setPhoneSessionInfo = useCallback(
    (info: string) => {
      _setPhoneSessionInfo(info);
      setMfaCodeNextResendAvailableTime(new Date(Date.now() + 30 * 1000));
    },
    [_setPhoneSessionInfo],
  );

  const verifyMfaCode = useCallback(
    async (mfaCode: string): Promise<boolean> => {
      if (options.onVerifyMfaCode) {
        if (!phoneSessionInfo) {
          throw new Error('MFA code needs to be requested before calling MFA code verification');
        }
        setIsCheckingMfaCode(true);
        let result: SUCCESS_RESULT;
        try {
          result = await options.onVerifyMfaCode(phoneSessionInfo, mfaCode);
          setMfaCheckError(null);
        } catch (error: any) {
          if (error instanceof APIFunctionError) {
            const { name, data } = error;
            if (name === EAPIFunctionErrorTypes.MFA_INVALID_CODE) {
              if (data?.multipleFailedAttempts) {
                setRequireExplicitRecaptcha(true);
              }
            }
            message.error(error.message);
          } else {
            message.error(error);
          }
          setMfaCheckError(error);
        }
        if (result) {
          if (options.onMfaCheckSuccess) {
            try {
              await options.onMfaCheckSuccess(result);
              setIsCheckingMfaCode(false);
              return true;
            } catch (error: any) {
              message.error(error.message);
            }
          } else {
            setIsCheckingMfaCode(false);
            return true;
          }
        }
        setIsCheckingMfaCode(false);
        return false;
      }
    },
    [phoneSessionInfo, options],
  );

  const resendMfaCode = useCallback(
    async (recaptchaToken: string, mobileNumber?: string): Promise<boolean> => {
      if (options.onResendMfaCode) {
        if (mfaCodeResendNextAvailableTime > new Date()) {
          message.error('Verification code is not ready to be sent again');
        }
        setIsResendingMfaCode(true);
        let newPhoneSessionInfo: string;
        try {
          const result = await options.onResendMfaCode(
            recaptchaToken,
            mobileNumber || mfaMobileNumber,
          );
          newPhoneSessionInfo = result.phoneSessionInfo;
          setMfaCheckError(null);
          message.success(
            `A verification code has been sent to the mobile number: ${
              mobileNumber || mfaMobileNumber
            }`,
          );
        } catch (error: any) {
          if (error instanceof Error) {
            message.error(error.message);
          } else {
            message.error(error);
          }
          setMfaCheckError(error);
        }
        setIsResendingMfaCode(false);
        if (newPhoneSessionInfo) {
          setPhoneSessionInfo(newPhoneSessionInfo);
          if (options.onResendMfaCodeSuccess) {
            options.onResendMfaCodeSuccess();
          }
          return true;
        }
        return false;
      }
    },
    [options, mfaMobileNumber, mfaCodeResendNextAvailableTime, setPhoneSessionInfo],
  );

  const setMfaMobileNumberAndSendMfaCode = useCallback(
    (recaptchToken: string, mobileNumber: string): Promise<boolean> => {
      setMfaMobileNumber(mobileNumber);
      return resendMfaCode(recaptchToken, mobileNumber);
    },
    [setMfaMobileNumber, resendMfaCode],
  );

  useEffect(() => {
    const updateResendAvailability = () => {
      if (!mfaCodeResendNextAvailableTime || new Date() >= mfaCodeResendNextAvailableTime) {
        setMfaCodeResendAvailable(true);
      } else {
        setMfaCodeResendAvailable(false);
      }
    };
    updateResendAvailability();
    const timer = setInterval(updateResendAvailability, 1000);
    return () => clearInterval(timer);
  }, [mfaCodeResendNextAvailableTime]);

  return {
    isCheckingMfaCode,
    isResendingMfaCode,
    mfaCheckError,
    requireExplicitRecaptcha,
    mfaCodeResendNextAvailableTime,
    mfaCodeResendAvailable,
    mfaMobileNumber,
    reset,
    verifyMfaCode,
    resendMfaCode,
    setPhoneSessionInfo,
    setMfaMobileNumber,
    setMfaMobileNumberAndSendMfaCode,
  };
}
