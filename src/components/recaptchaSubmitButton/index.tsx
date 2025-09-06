import React, { forwardRef } from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';

export interface IRecaptchaSubmitButtonRef {
  getRecaptchaVerifier(): any;
  recaptchaVerify(): Promise<string>;
}

function RecaptchaSubmitButton(props: ButtonProps, ref: React.Ref<IRecaptchaSubmitButtonRef>) {
  const { children, loading, ...restProps } = props;

  return (
    <div style={{ display: 'inline-block' }}>
      <Button loading={loading} {...restProps}>
        {children}
      </Button>
    </div>
  );
}

export default forwardRef(RecaptchaSubmitButton);
