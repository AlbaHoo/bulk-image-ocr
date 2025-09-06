import { EAgentErrorCode, EPmsErrorCode, EImErrorCode } from '@/shared/typings/error';
import { EPMSType, EIMType, IPMSOption, IIMOption } from '@/shared/typings';

export function getAgentErrorCode(errName: string) {
  const findedErrorCode = Object.values(EAgentErrorCode).find((value) => errName.includes(value));
  return findedErrorCode || EAgentErrorCode.unknownError;
}

export const AGENT_ERROR_CODE_MSG: Record<EAgentErrorCode, string> = {
  [EAgentErrorCode.socketConnectFailure]: 'Socket connect failure',
  [EAgentErrorCode.unknownError]: 'Unknown error',
};

export const PMS_ERROR_CODE_MSG: Record<EPmsErrorCode, string> = {
  [EPmsErrorCode.pmsNotInstalled]: 'Not Installed',
  [EPmsErrorCode.pmsServiceNotStarted]: 'Service is not running',
  [EPmsErrorCode.pmsConnectFailure]: 'Database connect failure',
  [EPmsErrorCode.pmsIntegrationNotSupported]: 'Integration module is not detected',
  [EPmsErrorCode.unknownError]: 'Unknown error',
};

export const IM_ERROR_CODE_MSG: Record<EImErrorCode, string> = {
  [EImErrorCode.imNotInstalled]: 'Not Installed',
  [EImErrorCode.imServiceNotStarted]: 'Service is not running',
  [EImErrorCode.imConnectFailure]: 'Database connect failure',
  [EImErrorCode.imIntegrationNotSupported]: 'Integration module is not detected',
  [EImErrorCode.imOutputPermissionIssue]:
    'Can not find an output folder for CMS with proper permission.',
  [EImErrorCode.unknownError]: 'Unknown error',
};

export const PMS_OPTIONS: IPMSOption[] = [
  { key: EPMSType.dental4windows, label: 'Dental4Windows' },
];

export const IM_OPTIONS: IIMOption[] = [
  { key: EIMType.centaurMediaSuite, label: 'Centaur MediaSuite' },
  { key: EIMType.romexis, label: 'Romexis' },
];

export function getPMSOptionLabel(optionKey: EPMSType): string {
  return (PMS_OPTIONS.find((item) => item.key === optionKey) || {}).label;
}

export function getIMOptionLabel(optionKey: EIMType): string {
  return (IM_OPTIONS.find((item) => item.key === optionKey) || {}).label;
}

export function getErrorPMSType(errorMsg: string): EPMSType {
  return (PMS_OPTIONS.find((item) => errorMsg?.includes(item.label)) || {}).key;
}

export function getErrorIMTypes(errorMsg: string): EIMType[] {
  return IM_OPTIONS.reduce(
    (errorIMTypes, item) =>
      errorMsg?.includes(item.label) ? errorIMTypes.concat(item.key) : errorIMTypes,
    [],
  );
}
