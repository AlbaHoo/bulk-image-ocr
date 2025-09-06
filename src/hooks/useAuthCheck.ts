import { useCallback, useState } from 'react';
import { message } from 'antd';
import { IMfaRequiredResult } from '@/typings/auth';
import { APIFunctionError } from '@/utils/error';

export enum EAuthCheckStep {
  password = 'password',
  mfa = 'mfa',
}

export default function useAuthCheck<AUTH_RESULT>(options: {
  onCheckPassword(password: string, email?: string): Promise<AUTH_RESULT | IMfaRequiredResult>;
  onAuthCheckSuccess(result: AUTH_RESULT): Promise<void>;
}) {
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordCheckError, setPasswordCheckError] = useState<APIFunctionError | unknown>();

  const checkPassword = useCallback(
    async (password: string, email?: string): Promise<boolean> => {
      if (options.onCheckPassword) {
        setIsCheckingPassword(true);
        let result: AUTH_RESULT | IMfaRequiredResult;
        try {
          result = await options.onCheckPassword(password, email);
        } catch (error: any) {
          if (error instanceof APIFunctionError) {
            message.error(error.message);
          } else {
            message.error(error);
          }
          setPasswordCheckError(error);
        }
        if (result) {
          if (options.onAuthCheckSuccess) {
            try {
              await options.onAuthCheckSuccess(result as AUTH_RESULT);
              setIsCheckingPassword(false);
              return true;
            } catch (error: any) {
              message.error(error.message);
            }
          }
        }
        setIsCheckingPassword(false);
        return false;
      }
    },
    [options],
  );

  return {
    isCheckingPassword,
    passwordCheckError,
    checkPassword,
  };
}
