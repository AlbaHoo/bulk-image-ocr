export interface IScheduleConfig {
  frequencyInHours: number;
  timezone: string;
  hasExcludeHourRange: boolean;
  excludeRangeStartHour?: number;
  excludeRangeEndHour?: number;
}

export enum EAgentStatus {
  unauthorised = 'unauthorised', // integration service token expired
  pmsAccessDenied = 'pmsAccessDenied', // can not access to your PMS data
  operational = 'operational',
}

export interface IAgentStatusDetail {
  status?: EAgentStatus;
  socketConnected?: boolean;
  lastCheckError?: string;
  localActivityUpdatedAt?: number;
}

export enum EProcedureType {
  pms = 'pms',
  im = 'im',
}

export enum EPMSType {
  dental4windows = 'dental4windows',
}

export enum EIMType {
  centaurMediaSuite = 'centaurMediaSuite',
  romexis = 'romexis',
}

export interface IPMSOption {
  key: EPMSType;
  label: string;
}

export interface IIMOption {
  key: EIMType;
  label: string;
}

export type ISyncPMSDataProgressStatus = 'active' | 'success' | 'normal' | 'exception';

export interface ISyncPMSDataProgress {
  status: ISyncPMSDataProgressStatus;
  percent: number;
}

export interface IItemsAndCount<T> {
  data: T[];
  total: number;
}

export enum ELocalActivityStatus {
  processing = 'processing',
  success = 'success',
  error = 'error',
}

export interface ILocalActivityOptions {
  page?: number;
  pageSize?: number;
  status?: ELocalActivityStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface ILocalActivity {
  status: ELocalActivityStatus;
  syncStartedAt: Date;
  syncSummary: string;
  syncError: string;
  dataToSync: any;
}

export interface IIntegrationSetting {
  odbcDriverName?: string;
  odbcDSNName?: string;
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbEngine?: string;
  dbPath?: string;
  dbUser?: string;
  dbPassword?: string;
}

export type IIntegrationSettings = Partial<Record<EPMSType | EIMType, IIntegrationSetting>>;

export interface ISelectedElement {
  xpath: string;
  text: string;
  url: string;
}
