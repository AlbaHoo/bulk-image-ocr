import React, { useState } from 'react';
import { Button, Upload, Image, message, Spin, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { Apis } from '@/services';
import { ImageItem } from '@/services/image-item.service';

const { Text } = Typography;

interface ImagePlaceholderProps {
  order: number;
  imageListId: string;
  existingItem: ImageItem | null;
  onImageUploaded: (item: ImageItem) => void;
  onImageDeleted: (imageId: string) => void;
  onTextUpdated: (order: number, text: string) => void;
  columns: number;
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'saving' | 'complete';

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  order,
  imageListId,
  existingItem,
  onImageUploaded,
  onImageDeleted,
  onTextUpdated,
  columns,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [showFullText, setShowFullText] = useState(false);

  // Calculate row and column indices (1-based)
  const rowIndex = Math.floor(order / columns) + 1;
  const columnIndex = (order % columns) + 1;

  const resizeImageForOCR = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');

      img.onload = () => {
        // OCR best practices: target 1024-2048px on longer side
        const MAX_DIMENSION = 1600; // Good balance for PaddleOCR

        let { width, height } = img;

        // Calculate scaling factor - ONLY scale down, never scale up
        const longerSide = Math.max(width, height);

        let scaleFactor = 1;

        // Only scale down if image is too large
        if (longerSide > MAX_DIMENSION) {
          scaleFactor = MAX_DIMENSION / longerSide;
        }
        // If image is smaller than MAX_DIMENSION, keep original size

        // Apply scaling while maintaining aspect ratio
        const newWidth = Math.round(width * scaleFactor);
        const newHeight = Math.round(height * scaleFactor);

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Use high-quality scaling
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert to JPEG with optimized quality for OCR
          const base64 = canvas.toDataURL('image/jpeg', 0.87); // 87% quality - good balance
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    console.log('Starting upload for order:', order);
    setUploadState('uploading');

    try {
      // Upload image first
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Resizing image for OCR optimization...');
      const base64 = await resizeImageForOCR(file);

      console.log('File processed and resized, uploading to server...');
      const imageItemService = Apis.getImageItemApi();
      const newItem = await imageItemService.createImageItem({
        fileName: file.name,
        fileData: { base64 },
        order,
        imageListId,
      });

      console.log('Upload completed, showing image immediately');
      // Show image immediately after upload
      setUploadState('idle');
      onImageUploaded(newItem);
      message.success('图片上传完成，正在进行文字识别...');

      // Continue OCR analysis in background
      setUploadState('analyzing');
      console.log('Starting OCR analysis in background...');

      const ocrService = Apis.getOcrApi();
      const ocrResult = await ocrService.ocrFromBase64(base64);

      console.log('OCR analysis completed, saving text...');
      setUploadState('saving');

      // Save OCR text to ImageItem
      const extractedText = ocrResult.boxes.map(box => box.text).join(' ');
      const updatedItem = await imageItemService.updateImageItemOcrText(newItem.id, extractedText);

      console.log('Text saved successfully');
      setUploadState('complete');
      setTimeout(() => setUploadState('idle'), 1000); // Clear processing state after 1s
      message.success('文字识别完成');
      onTextUpdated(order, extractedText);
    } catch (error) {
      message.error('图片上传或分析失败');
      console.error('Error uploading image or OCR:', error);
      setUploadState('idle');
    }
  };

  const handleDeleteImage = async (e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!existingItem) return;

    try {
      const imageItemService = Apis.getImageItemApi();
      await imageItemService.deleteImageItem(existingItem.id);
      message.success('图片删除成功');
      onImageDeleted(existingItem.id);
    } catch (error) {
      message.error('图片删除失败');
      console.error('Error deleting image:', error);
    }
  };

  const getStateDisplay = () => {
    switch (uploadState) {
      case 'uploading':
        return {
          text: '正在上传...',
          color: '#1890ff',
        };
      case 'analyzing':
        return {
          text: '正在分析...',
          color: '#52c41a',
        };
      case 'saving':
        return {
          text: '正在保存文本...',
          color: '#722ed1',
        };
      default:
        return null;
    }
  };

  const renderOcrText = () => {
    if (!existingItem?.ocrText) return null;

    const isLongText = existingItem.ocrText.length > 20;
    const displayText = showFullText || !isLongText
      ? existingItem.ocrText
      : existingItem.ocrText.substring(0, 20) + '...';

    return (
      <div style={{ marginTop: '8px', padding: '4px 8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
        <Text style={{ fontSize: '12px', color: '#666' }}>
          {displayText}
        </Text>
        {isLongText && (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ padding: '0 4px', fontSize: '12px', height: 'auto' }}
            onClick={() => setShowFullText(!showFullText)}
          >
            {showFullText ? '收起' : '详情'}
          </Button>
        )}
      </div>
    );
  };

  const isProcessing = ['uploading', 'analyzing', 'saving'].includes(uploadState);
  const stateDisplay = getStateDisplay();

  console.log('Rendering ImagePlaceholder:', { order, uploadState, hasExistingItem: !!existingItem });

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          border: isProcessing ? '2px solid #1890ff' : '2px dashed #d9d9d9',
          borderRadius: '6px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: isProcessing ? '#f0f7ff' : existingItem ? '#fafafa' : '#fff',
          transition: 'all 0.3s ease',
        }}
      >
        {uploadState === 'uploading' ? (
          <div style={{ textAlign: 'center' }}>
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: '32px', color: stateDisplay?.color }} spin />}
            />
            <div style={{ marginTop: '12px', color: stateDisplay?.color, fontSize: '16px', fontWeight: 'bold' }}>
              {stateDisplay?.text}
            </div>
          </div>
        ) : existingItem ? (
          <>
            <Image
              src={existingItem.fileUrl}
              alt={existingItem.fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '100px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
            {/* OCR processing overlay */}
            {(uploadState === 'analyzing' || uploadState === 'saving') && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px'
              }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <Spin
                    size="small"
                    indicator={<LoadingOutlined style={{ fontSize: '16px', color: 'white' }} spin />}
                  />
                  <div style={{ marginTop: '4px', fontSize: '12px' }}>
                    {stateDisplay?.text}
                  </div>
                </div>
              </div>
            )}
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 10 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteImage(e);
              }}
            />
          </>
        ) : (
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              console.log('Upload triggered for file:', file.name);
              handleFileUpload(file);
              return false;
            }}
            accept="image/*"
            disabled={isProcessing}
          >
            <div style={{ textAlign: 'center', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
              <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
              <div style={{ marginTop: '8px', color: '#999' }}>
                上传图片
              </div>
            </div>
          </Upload>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: isProcessing ? '#1890ff' : '#999' }}>
        位置 [{rowIndex},{columnIndex}] {isProcessing && `(${stateDisplay?.text})`}
      </div>
      {renderOcrText()}
    </div>
  );
};

export default ImagePlaceholder;
