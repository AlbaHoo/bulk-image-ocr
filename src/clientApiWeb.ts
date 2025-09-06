import { ILocalActivity, ILocalActivityOptions, ISelectedElement } from 'shared/typings';
import { IClientApi } from './interfaces/IClientApi';
import { v4 as uuidv4 } from 'uuid';

// Generate agentId and store
function generateAgentId(): string {
  if (!getAgentId()) {
    const agentId = uuidv4();
    localStorage.setItem('agentId', agentId);
    return agentId;
  }
}

function getAgentId(): string {
  const agentId = localStorage.getItem('agentId') as string;
  return agentId;
}

export class BrowserClientApi implements IClientApi {
  getAppVersion(): string {
    return '1.0.0';
  }

  generateAgentId() {
    if (!getAgentId()) {
      const agentId = uuidv4();
      localStorage.setItem('agentId', agentId);
      return agentId;
    }
  }
  getAgentId() {
    const agentId = localStorage.getItem('agentId') as string;
    return agentId;
  }
  getField(field: string): string {
    const value = localStorage.getItem(field) as string;
    return value;
  }
  setField(field: string, value: string): string {
    localStorage.setItem(field, value);
    return value;
  }

  clearStore(): void {
    localStorage.clear();
  }

  getLocalActivitiesAndCount(
    options: ILocalActivityOptions,
  ): Promise<{ data: ILocalActivity[]; total: number }> {
    return Promise.resolve({ data: [], total: 0 });
  }
  readLogChunk(fileIndex: number, chunkIndex: number): Promise<string> {
    return Promise.resolve('browser cannot read loca log file directly, mock log data');
  }

  platform(): string {
    return 'web';
  }
}

const single = new BrowserClientApi();

export default single;
