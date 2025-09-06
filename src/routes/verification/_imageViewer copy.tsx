import React, { useState, useRef } from 'react';
import { generateImageHash } from 'utils/md5';
import styles from './index.module.css';
import { Apis } from 'services';
import { message, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { downloadFile } from 'platforms';

interface IPropTypes {
  containerHeight: number;
}

export default function ImageViewer(props: IPropTypes) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState<boolean>(false);
  const [capturing, setCapturing] = useState<boolean>(false);

  const [pngHash, setPngHash] = useState<string>('');
  const [jpegHash, setJpegHash] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initialise = () => {
    setImageSrc(null);
    setPngHash('');
    setJpegHash('');
    setCameraOn(true);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Wait for the video to be ready
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            resolve(true);
          };
        });
        initialise();
      }
    } catch (error) {
      console.error('Error accessing the camera', error);
      const msg = error instanceof Error ? error.message : 'Error accessing the camera';
      message.error(msg);
    }
  };

  const captureImage = async () => {
    if (videoRef.current) {
      setCapturing(true);
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the video frame to the canvas
        context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/png');
        setImageSrc(image);

        // Generate hashes for the image
        const pngHash = generateImageHash(image, 'png');
        console.log('PNG Hash:', pngHash);

        // Convert the image data URL to JPEG format
        const jpegImage = canvas.toDataURL('image/jpeg');
        const jpegHash = generateImageHash(jpegImage, 'jpeg');
        console.log('JPEG Hash:', jpegHash);

        setPngHash(pngHash);
        setJpegHash(jpegHash);

        // Stop all video tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());
        await Apis.getMediaApi().createHash(pngHash, image);
      } catch (e) {
        console.error('Error capturing image:', e);
      }
      setCapturing(false);
      setCameraOn(false);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraOn(false);
  };

  const savePng = () => {
    // Save the PNG image
    downloadFile(imageSrc, 'image.png');
  };

  const saveJpeg = () => {
    // Save the JPEG image
    message.info('Saving JPEG image not implemented');
  };

  return (
    <div className={styles.createContainer}>
      <div className={styles.buttons}>
        {!cameraOn && <button onClick={openCamera}>Open Camera</button>}
        {cameraOn && (
          <button onClick={captureImage}>{capturing ? 'Capturing' : 'Capture'} Image</button>
        )}
      </div>

      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          width="100%"
          height="auto"
          style={{ display: cameraOn ? 'block' : 'none' }}
        ></video>
        {cameraOn && (
          <div className={styles.videoButtons}>
            {cameraOn && (
              <Button icon={<CloseOutlined />} onClick={closeCamera}>
                Close
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={styles.imageContainer}>
        {imageSrc && <img src={imageSrc} alt="Captured" width="100%" />}
        {pngHash && <div>PNG Hash: {pngHash}</div>}
        {jpegHash && <div>JPEG Hash: {jpegHash}</div>}
      </div>

      {imageSrc && (
        <div className={styles.buttons}>
          <button onClick={savePng}>Save PNG</button>
          <button onClick={saveJpeg}>Save JPEG</button>
        </div>
      )}
    </div>
  );
}
