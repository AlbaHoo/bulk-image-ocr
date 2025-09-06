import React from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const CreationMobile: React.FC = () => {
  const openCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });
      console.log('Photo taken:', photo);
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  return (
    <div>
      <button onClick={openCamera}>Open Camera</button>
    </div>
  );
};

export default CreationMobile;
