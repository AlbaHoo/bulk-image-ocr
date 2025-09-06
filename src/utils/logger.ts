export const overrideConsoleLogWithWinston = () => {
  // take over all console log in main process
  // console.log = (...args) => window.lwsClientAPI.rendererLogInfo('[UI-log]', ...args);
  // console.info = (...args) => window.lwsClientAPI.rendererLogInfo('[UI-info]', ...args);
  // console.warn = (...args) => window.lwsClientAPI.rendererLogInfo('[UI-warn]', ...args);
  // console.error = (...args) => window.lwsClientAPI.rendererLogInfo('[UI-error]', ...args);
  // console.debug = (...args) => window.lwsClientAPI.rendererLogInfo('[UI-debug]', ...args);
};
