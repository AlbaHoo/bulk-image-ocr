export interface IMfaRequiredResult {
  mfaPendingCredential: string;
  phoneSessionInfo: string;
  maskedPhoneNumber: string;
}

export interface IAuthorizeAgentResponse {
  integrationToken: string;
  practiceId: string;
}
