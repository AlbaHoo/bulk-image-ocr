import React from 'react';
import { Card } from 'antd';
import { ImageItem } from '@/services/image-item.service';
import ImagePlaceholder from './ImagePlaceholder';

interface MobileImageGridProps {
  columns: number;
  imageItems: ImageItem[];
  imageListId: string;
  additionalRows: number;
  cameraFiles: { [position: number]: File };
  onImageUpload: (order: number, file: File) => Promise<ImageItem>;
  onImageOcrAnalysis: (order: number, base64Data: string, imageItem?: ImageItem) => Promise<void>;
  onImageOcrTextUpdate: (order: number, text: string) => Promise<void>;
  onImageDeleted: (imageId: string) => void;
  onCameraFileProcessed: (position: number) => void;
}

const MobileImageGrid: React.FC<MobileImageGridProps> = ({
  columns,
  imageItems,
  imageListId,
  additionalRows,
  cameraFiles,
  onImageUpload,
  onImageOcrAnalysis,
  onImageOcrTextUpdate,
  onImageDeleted,
  onCameraFileProcessed,
}) => {
  const maxOrder = imageItems.length > 0 ? Math.max(...imageItems.map(item => item.order)) : -1;
  const minRequiredRows = imageItems.length > 0 ? Math.ceil((maxOrder + 1) / columns) : 1;
  const totalRows = minRequiredRows + additionalRows;
  const totalSlots = totalRows * columns;

  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    const existingItem = imageItems.find(item => item.order === i) || null;
    const rowIndex = Math.floor(i / columns) + 1;
    const columnIndex = (i % columns) + 1;

    slots.push(
      <Card
        key={i}
        size="small"
        title={`位置 [${rowIndex},${columnIndex}]`}
        style={{
          marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <ImagePlaceholder
          order={i}
          imageListId={imageListId}
          existingItem={existingItem}
          cameraFile={cameraFiles[i]}
          onImageUpload={onImageUpload}
          onImageOcrAnalysis={onImageOcrAnalysis}
          onImageOcrTextUpdate={onImageOcrTextUpdate}
          onImageDeleted={onImageDeleted}
          onCameraFileProcessed={onCameraFileProcessed}
          columns={columns}
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: '0 8px' }}>
      {slots}
    </div>
  );
};

export default MobileImageGrid;
