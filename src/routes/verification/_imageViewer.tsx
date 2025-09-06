import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { message, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { downloadFile } from 'platforms';
import useCamera from 'hooks/useCamera';
import { getSignature, signImage } from 'utils/image';
import { Apis } from 'services';

interface IPropTypes {
  containerHeight: number;
}

export default function ImageViewer(props: IPropTypes) {
  const [capturing, setCapturing] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pngHash, setPngHash] = useState('');
  const [signedImageSrc, setSignedImageSrc] = useState<string | null>(null);

  const [signature, setSignature] = useState<string | null>(null);

  const { videoRef, cameraOn, openCamera, captureImage, closeCamera } = useCamera();

  useEffect(() => {
    if (imageSrc) {
      signImage(imageSrc, 'png', {
        hash: pngHash,
      }).then((signed) => {
        setSignedImageSrc(signed);
        getSignature(signed, 'png').then((sig) => setSignature(sig));
      });
    }
  }, [imageSrc]);

  const savePng = () => {
    // Save the PNG image
    downloadFile(imageSrc, 'image.png');
  };

  const handleCaptureImage = async () => {
    setCapturing(true);
    try {
      const res = await captureImage('png');
      setImageSrc(res.image);
      setPngHash(res.hash);

      const signed = await signImage(imageSrc, 'png', {
        hash: pngHash,
      });
      setSignedImageSrc(signed);
      const sig = await getSignature(signed, 'png');
      setSignature(sig);
      await Apis.getMediaApi().createHash(pngHash, signed);
    } catch (error) {}
    setCapturing(false);
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
          <button onClick={handleCaptureImage}>{capturing ? 'Capturing' : 'Capture'} Image</button>
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
        {/* {jpegHash && <div>JPEG Hash: {jpegHash}</div>} */}
      </div>

      {imageSrc && (
        <div className={styles.buttons}>
          <button onClick={savePng}>Save PNG</button>
          <button onClick={saveJpeg}>Save JPEG</button>
        </div>
      )}

      {signedImageSrc && <img src={signedImageSrc} alt="Signed" width="100%" />}
      {signature && <div>signature: {signature}</div>}
    </div>
  );
}
