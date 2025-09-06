import React, { useState } from 'react';
import { Button, Upload, Image, message, Spin, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { Apis } from '../services';
import { ImageItem } from '../services/image-item.service';

const { Text } = Typography;

interface ImagePlaceholderProps {
  order: number;
  imageListId: string;
  existingItem: ImageItem | null;
  onImageUploaded: (item: ImageItem) => void;
  onImageDeleted: (imageId: string) => void;
  onTextUpdated: (order: number, text: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'saving' | 'complete';

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  order,
  imageListId,
  existingItem,
  onImageUploaded,
  onImageDeleted,
  onTextUpdated,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [showFullText, setShowFullText] = useState(false);

  const handleFileUpload = async (file: File) => {
    console.log('Starting upload for order:', order);
    setUploadState('uploading');

    try {
      // Upload image first
      await new Promise(resolve => setTimeout(resolve, 100));

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Data = result?.split(',')[1];
          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
      });

      console.log('File read completed, uploading to server...');
      const imageItemService = Apis.getImageItemApi();
      const newItem = await imageItemService.createImageItem({
        fileName: file.name,
        fileData: { base64 },
        order,
        imageListId,
      });

      console.log('Upload completed, starting OCR analysis...');
      setUploadState('analyzing');

      // Perform OCR analysis
      const ocrService = Apis.getOcrApi();
      const ocrResult = await ocrService.ocrFromBase64(base64);

      console.log('OCR analysis completed, saving text...');
      setUploadState('saving');

      // Save OCR text to ImageItem
      const extractedText = ocrResult.boxes.map(box => box.text).join(' ');
      const updatedItem = await imageItemService.updateImageItemOcrText(newItem.id, extractedText);

      console.log('Text saved successfully');
      setUploadState('complete');
      message.success('图片上传及分析完成');
      onImageUploaded(updatedItem);
      onTextUpdated(order, extractedText);
    } catch (error) {
      message.error('图片上传或分析失败');
      console.error('Error uploading image or OCR:', error);
      setUploadState('idle');
    }
  };

  const handleDeleteImage = async () => {
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
        {isProcessing ? (
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
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ position: 'absolute', top: '4px', right: '4px' }}
              onClick={handleDeleteImage}
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
        位置 {order} {isProcessing && `(${stateDisplay?.text})`}
      </div>
      {renderOcrText()}
    </div>
  );
};

export default ImagePlaceholder;
