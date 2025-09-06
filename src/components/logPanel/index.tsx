import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { lwsClientAPI } from 'platforms';

interface IProps {
  containerHeight?: number;
}
export default function LogPanel(props: IProps) {
  const { containerHeight = 400 } = props;
  // concated log data
  const [data, setData] = useState<string>('');

  // there are multiple log files
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // read the chunkIndex of current log file
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  // set to true when all log files content are collected
  const [loadAll, setLoadAll] = useState(false);

  useEffect(() => {
    const logLoader = async () => {
      const chunk = await lwsClientAPI.readLogChunk(currentFileIndex, currentChunkIndex);
      if (chunk === 'EOF') {
        // end of one file, fileIndex ++
        setCurrentFileIndex(currentFileIndex + 1);
      } else if (chunk === 'EOAF') {
        // end of all file
        setLoadAll(true);
        message.success(`All logs loaded.`);
      } else {
        setData((previousData) => `${previousData}${chunk}`);
      }
    };
    if (!loadAll) {
      logLoader();
    }
  }, [currentFileIndex, currentChunkIndex, loadAll]);

  // when file ++, reset chunk index to 0
  useEffect(() => {
    setCurrentChunkIndex(0);
  }, [currentFileIndex]);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    e.stopPropagation();
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop < containerHeight + 50) {
      setCurrentChunkIndex(currentChunkIndex + 1);
    }
  };

  return (
    <Typography>
      <div
        style={{
          fontSize: 10,
          textAlign: 'left',
          width: '100%',
          height: containerHeight,
          overflow: 'scroll',
        }}
        onScroll={onScroll}
      >
        <pre>
          {data.split('\n').map((log, index) => {
            return (
              <div key={index} style={{ marginBottom: 5 }}>
                {log}
              </div>
            );
          })}
        </pre>
      </div>
    </Typography>
  );
}
