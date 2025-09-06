import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { TextProps } from 'antd/lib/typography/Text';

const { Text } = Typography;

interface IPropTypes extends TextProps {
  deadline: Date;
  onFinish?(): void;
}

function getSecondsLeft(deadline: Date) {
  const left = Math.ceil((deadline.getTime() - Date.now()) / 1000);
  return left || 0;
}

export default function CountdownText({ deadline, onFinish, ...rest }: IPropTypes) {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft(deadline));

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onFinish) {
        onFinish();
      }
    } else {
      const timer = setTimeout(() => {
        setSecondsLeft(getSecondsLeft(deadline));
      }, 1000);
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  });
  return (
    <Text {...rest}>
      {secondsLeft}s
    </Text>
  );
}
