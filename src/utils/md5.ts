import sha256 from 'crypto-js/sha256';
import { Buffer } from 'buffer';

export const generateImageHash = (dataUrl: string, format: 'png' | 'jpeg'): string => {
  // Extract the base64-encoded string from the data URL
  console.log('dataUrl', sha256);
  const base64String = dataUrl.split(',')[1];

  // Convert the base64 string to a binary buffer
  const binaryBuffer = Buffer.from(base64String, 'base64');

  // Generate a hash for the specified format
  const hash = sha256(binaryBuffer.toString('binary')).toString();

  return hash;
};
