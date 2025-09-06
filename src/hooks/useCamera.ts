import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import { generateImageHash } from '@/utils/md5';

const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  const initialise = useCallback(() => {
    setCameraOn(true);
  }, []);

  const openCamera = useCallback(async () => {
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
  }, [initialise]);

  const captureImage = useCallback(async (type = 'png') => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the video frame to the canvas
        context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL(`image/${type}`);

        // Generate hashes for the image
        const hash = generateImageHash(image, type as 'png' | 'jpeg');
        console.log(`${type} hash: {hash}`, hash);
        // Stop all video tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setCameraOn(false);
        return {
          image,
          hash,
          type,
        };
      } catch (e) {
        setCameraOn(false);
        console.error('Error capturing image:', e);
      }
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraOn(false);
  }, []);

  return {
    videoRef,
    cameraOn,
    openCamera,
    captureImage,
    closeCamera,
  };
};

export default useCamera;
