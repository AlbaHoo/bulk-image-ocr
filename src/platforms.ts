import { Capacitor } from '@capacitor/core';
import { IClientApi } from '@/interfaces/IClientApi';
import { BrowserClientApi } from '@/clientApiWeb';
import { AndroidClientApi } from '@/clientApiAndroid';
import { downloadImageAsHtmlElement } from '@/utils/image';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { message } from 'antd';

export function isElectron() {
  // Renderer process
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    window.process['type'] === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
}

export function getCurrentPlatform(): 'web' | 'electron' | 'android' | 'ios' {
  if (isElectron()) {
    return 'electron';
  }

  if (Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      return 'android';
    }
    if (Capacitor.getPlatform() === 'ios') {
      return 'ios';
    }
  }

  return 'web';
}

export async function downloadFile(imageDataUrl: string, fileName = 'file') {
  const platform = getCurrentPlatform();

  if (platform === 'android') {
    try {
      const fileName = `image_${new Date().getTime()}.jpeg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: imageDataUrl,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log('File saved:', savedFile);
      message.success(`File saved to ${savedFile?.uri}`);
    } catch (error) {
      console.error('Error saving file:', error);
      message.error(`Error saving file: ${error}`);
    }
  } else {
    downloadImageAsHtmlElement(imageDataUrl, fileName);
    message.success('File saved');
  }
}

console.log(`current platform is: ${getCurrentPlatform()}`);

// export const lwsClientAPI: IClientApi = getCurrentPlatform() === 'electron' ? window.lwsClientAPI : mockClientApi;

let lwsClientAPI: IClientApi;

switch (getCurrentPlatform()) {
  case 'electron':
    lwsClientAPI = window.lwsClientAPI;
    break;
  case 'android':
    lwsClientAPI = new AndroidClientApi();
    break;
  case 'ios':
    lwsClientAPI = new AndroidClientApi();
    break;
  default:
    lwsClientAPI = new BrowserClientApi();
}

export { lwsClientAPI };
