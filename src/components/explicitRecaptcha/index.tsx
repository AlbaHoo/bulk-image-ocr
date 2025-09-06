import React, { forwardRef, Ref } from 'react';

interface IRecaptchaVerifier {
  clear(): void;
  verify(): Promise<string>;
  render(): Promise<void>;
}

export interface IExplicitRecaptchaRef {
  getVerifier(): IRecaptchaVerifier;
  verify(): string;
  reset(): void;
}


function ExplicitRecaptcha(props, ref: Ref<IExplicitRecaptchaRef>) {
  return <div></div>;
}

export default forwardRef(ExplicitRecaptcha);
