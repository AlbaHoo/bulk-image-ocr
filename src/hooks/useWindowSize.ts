import { useState, useEffect } from 'react';

export enum EWindowType {
  desktop,
  tablet,
  mobile,
}

function getWindowType(windowWidth: number) {
  if (windowWidth <= 768) {
    return EWindowType.mobile;
  } else if (windowWidth <= 1024) {
    return EWindowType.tablet;
  } else {
    return EWindowType.desktop;
  }
}

// @link https://usehooks.com/useWindowSize/
export default function useWindowSize() {
  const isClient = typeof window === 'object';
  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    windowSize,
    windowType: getWindowType(windowSize.width),
  };
}
