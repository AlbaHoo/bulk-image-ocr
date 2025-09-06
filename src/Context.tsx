import React, { createContext, useState } from 'react';
import { EAgentStatus } from '@/shared/typings';

export interface IGlobalContextValue {
  agentStatus: EAgentStatus;
  socketConnected: boolean;
  lastCheckError: string;
  localActivityUpdatedAt: number;
  setAgentStatus(status: EAgentStatus): void;
  setSocketConnected(socketConnected: boolean): void;
  setLastCheckError(error: string): void;
  setLocalActivityUpdatedAt(timestamp: number): void;
}

export const GlobalContext = createContext<IGlobalContextValue>(null);

export default function GlobalProvider(props: React.PropsWithChildren) {
  const [agentStatus, setAgentStatus] = useState(EAgentStatus.operational);
  const [socketConnected, setSocketConnected] = useState<boolean>(true);
  const [lastCheckError, setLastCheckError] = useState<string>(null);
  const [localActivityUpdatedAt, setLocalActivityUpdatedAt] = useState<number>(null);

  return (
    <GlobalContext.Provider
      value={{
        agentStatus,
        socketConnected,
        lastCheckError,
        localActivityUpdatedAt,
        setAgentStatus,
        setSocketConnected,
        setLastCheckError,
        setLocalActivityUpdatedAt,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
