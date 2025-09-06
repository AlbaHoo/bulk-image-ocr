import React, { useState } from 'react';
import { generateImageHash } from 'utils/md5';
import styles from './index.module.css';
import { Apis } from 'services';
import { Tag } from 'antd';

interface IPropTypes {
  containerHeight: number;
}

export default function Verify(props: IPropTypes) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pngHash, setPngHash] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<string>('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setLoading(true);
        setSelectedImage(reader.result as string);
        const pngHash = generateImageHash(reader.result as string, 'png');
        setPngHash(pngHash);
        try {
          const record = await Apis.getMediaApi().verifyHash(pngHash);
          if (record) {
            setVerifyResult('Verified');
          } else {
            setVerifyResult('Unverified');
          }
        } catch (e) {
          setVerifyResult('VerifyError');
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.imageContainer}>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {selectedImage && <img src={selectedImage} alt="Selected" width="100%" />}
      {pngHash && <div>PNG Hash: {pngHash}</div>}
      {loading && <div>Verifing...</div>}
      {verifyResult && (
        <div>
          <Tag color={verifyResult === 'Verified' ? 'success' : 'error'}>{verifyResult}</Tag>
        </div>
      )}
    </div>
  );
}
