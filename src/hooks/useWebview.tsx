import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WebViewContextProps {
  url: string;
  setUrl: (url: string) => void;
}

const WebViewContext = createContext<WebViewContextProps | undefined>(undefined);

export const WebViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [url, setUrl] = useState<string>('https://www.google.com');

  return <WebViewContext.Provider value={{ url, setUrl }}>{children}</WebViewContext.Provider>;
};

export const useWebView = () => {
  const context = useContext(WebViewContext);
  if (!context) {
    throw new Error('useWebView must be used within a WebViewProvider');
  }
  return context;
};
