export enum EAgentErrorCode {
  socketConnectFailure = 'socketConnectFailure', // websocket is disconnected
  unknownError = 'unknownError', // other temp errors
}

export enum EPmsErrorCode {
  pmsNotInstalled = 'pmsNotInstalled',
  pmsServiceNotStarted = 'pmsServiceNotStarted',
  pmsConnectFailure = 'pmsConnectFailure', // e.g. D4W username/password/permission error
  pmsIntegrationNotSupported = 'pmsIntegrationNotSupported', // D4W needs upgrade
  unknownError = 'unknownError', // other temp errors
}

export enum EImErrorCode {
  imNotInstalled = 'imNotInstalled',
  imServiceNotStarted = 'imServiceNotStarted',
  imConnectFailure = 'imConnectFailure',
  imIntegrationNotSupported = 'imIntegrationNotSupported', // CMS needs upgrade
  // we can not find a proper output folder for cms to export images
  // or the image we use cms can export images but we do not have enough permission to delete images for clean up
  imOutputPermissionIssue = 'imOutputPermissionIssue',
  unknownError = 'unknownError', // other temp errors
}
