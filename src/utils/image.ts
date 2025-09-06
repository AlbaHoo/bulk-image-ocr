import { Buffer } from 'buffer';

export function downloadImageAsHtmlElement(imageDataUrl: string, imageName = 'image.png') {
  // Save the PNG image
  const link = document.createElement('a');
  link.href = imageDataUrl;
  link.download = imageName;
  link.click();
}

export interface ISignature {
  hash: string;
  author?: string;
  authorId?: string;
}

export function signImage(
  imageBase64: string,
  type: 'png' | 'jpeg',
  signature: ISignature,
): Promise<string> {
  const sign = JSON.stringify(signature);
  // Convert the text to base64 using TextEncoder and TextDecoder
  const encoder = new TextEncoder();
  const data = encoder.encode(sign);
  const textBase64 = Buffer.from(data).toString('base64');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }
  const image = new Image();
  image.src = `${imageBase64}`;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      // Get the image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      // Calculate the maximum number of characters that can fit in the first row
      const maxChars = Math.floor(canvas.width);
      const textLength = Math.min(textBase64.length, maxChars);
      // Replace the first row of pixels with the base64 ASCII values
      for (let i = 0; i < textLength; i++) {
        const asciiValue = textBase64.charCodeAt(i);
        pixels[i * 4 + 3] = asciiValue; // Set the alpha channel to 255 (fully opaque)
      }

      // Put the modified image data back to the canvas
      context.putImageData(imageData, 0, 0);

      // Get the new base64 image
      const newImageBase64 = canvas.toDataURL(`image/${type}`);
      resolve(newImageBase64);
    };

    image.onerror = (error) => {
      reject(new Error(`Failed to load image: Error: ${error}`));
    };
  });
}

export async function getSignature(imageBase64: string, type: 'png' | 'jpeg'): Promise<string> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  const image = new Image();
  image.src = imageBase64;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      // Get the image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const maxChars = Math.floor(canvas.width);
      let extractedText = '';

      // Extract the alpha channel values from the first row of pixels
      for (let i = 0; i < maxChars; i++) {
        const asciiValue = pixels[i * 4 + 3];
        if (asciiValue === 0) break; // Stop if we hit a zero value (end of text)
        extractedText += String.fromCharCode(asciiValue);
      }

      console.log(extractedText);
      // Convert the extracted text back to base64
      const extractedBase64 = Buffer.from(extractedText).toString();
      const decodedData = Uint8Array.from(Buffer.from(extractedBase64, 'base64'));
      const normalString = new TextDecoder().decode(decodedData);
      resolve(normalString);
    };

    image.onerror = (error) => {
      reject(new Error('Failed to load image'));
    };
  });
}

export const url2base64 = async (url: string): Promise<string> => {
  // Fetch the image
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }

  // Convert the response to a blob
  const blob = await response.blob();

  // Create a FileReader to read the blob as a data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      let base64data = reader.result as string;
      if (!base64data.startsWith('data:image/')) {
        base64data = `data:image/png;base64,${base64data}`;
      }
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
