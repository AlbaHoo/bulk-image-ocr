import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Descriptions, Button, message, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined, CameraOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Apis } from '@/services';
import { ImageListItem } from '@/services/image-list.service';
import { ImageItem } from '@/services/image-item.service';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import MobileImageGrid from '@/components/MobileImageGrid';
import CameraModal from '@/components/CameraModal';
import styles from './index.module.css';
import useWindowSize, { EWindowType } from '@/hooks/useWindowSize';

const { TabPane } = Tabs;

const ImageListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageListDetail, setImageListDetail] = useState<ImageListItem | null>(null);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [additionalRows, setAdditionalRows] = useState(0);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraFiles, setCameraFiles] = useState<{[position: number]: File}>({});

  const { windowType } = useWindowSize();

  useEffect(() => {
    const fetchImageListDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const imageListService = Apis.getImageListApi();
        const imageList = await imageListService.getImageListById(id);
        setImageListDetail(imageList);
      } catch (error) {
        message.error('获取图片列表详情失败');
        console.error('Error fetching image list details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImageListDetail();
  }, [id]);

  const fetchImageItems = async () => {
    if (!id) return;

    setImageLoading(true);
    try {
      console.log('Fetching image items for list ID:', id);
      const imageItemService = Apis.getImageItemApi();
      const items = await imageItemService.getImageItemsByListId(id);
      console.log('Successfully fetched image items:', items);
      setImageItems(items);
    } catch (error) {
      console.error('Detailed error fetching image items:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(`获取图片列表失败: ${errorMessage}`);
    } finally {
      setImageLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'images' && imageItems.length === 0) {
      fetchImageItems();
    }
  };

  const handleImageUploaded = (newItem: ImageItem) => {
    setImageItems(prev => {
      const filtered = prev.filter(item => item.order !== newItem.order);
      return [...filtered, newItem].sort((a, b) => a.order - b.order);
    });
  };

  const handleImageDeleted = (imageId: string) => {
    setImageItems(prev => prev.filter(item => item.id !== imageId));
  };

  const handleTextUpdated = (order: number, text: string) => {
    setImageItems(prev =>
      prev.map(item =>
        item.order === order
          ? { ...item, ocrText: text }
          : item
      )
    );
  };

  const downloadCsv = () => {
    try {
      // Create CSV content
      const headers = ['位置', '文件名', '识别文本'];
      const csvContent = [
        headers.join(','),
        ...imageItems
          .filter(item => item.ocrText)
          .sort((a, b) => a.order - b.order)
          .map(item => [
            item.order,
            `"${item.fileName}"`,
            `"${item.ocrText?.replace(/"/g, '""') || ''}"`
          ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${imageListDetail?.name || 'image-list'}-ocr-results.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('CSV文件下载成功');
    } catch (error) {
      message.error('CSV文件下载失败');
      console.error('Error downloading CSV:', error);
    }
  };

  const downloadGridCsv = () => {
    try {
      if (!imageListDetail) return;

      const columns = imageListDetail.columns;
      const maxOrder = Math.max(-1, ...imageItems.map(item => item.order));
      const totalRows = Math.ceil((maxOrder + 1) / columns);

      // Create headers: 行号, 列1, 列2, 列3, ...
      const headers = ['行号', ...Array.from({ length: columns }, (_, i) => `列${i + 1}`)];

      // Create grid data
      const gridRows = [];
      for (let row = 0; row < totalRows; row++) {
        const rowData: string[] = [(row + 1).toString()]; // Row index starting from 1, converted to string

        for (let col = 0; col < columns; col++) {
          const order = row * columns + col;
          const item = imageItems.find(img => img.order === order);
          const text = item?.ocrText || '';
          rowData.push(`"${text.replace(/"/g, '""')}"`);
        }

        gridRows.push(rowData.join(','));
      }

      const csvContent = [headers.join(','), ...gridRows].join('\n');

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${imageListDetail?.name || 'image-list'}-grid-format.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('格式文本CSV下载成功');
    } catch (error) {
      message.error('格式文本CSV下载失败');
      console.error('Error downloading grid CSV:', error);
    }
  };

  const addNewRow = () => {
    setAdditionalRows(prev => prev + 1);
  };

  // Three centralized async methods for ImagePlaceholder
  const handleImageUpload = useCallback(async (order: number, file: File): Promise<ImageItem> => {
    const imageItemService = Apis.getImageItemApi();

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (result) {
          // Remove data URL prefix to get just the base64 data
          const base64 = result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });

    // Check if an ImageItem with this order already exists
    const existingItem = imageItems.find(item => item.order === order);

    let newItem: ImageItem;
    if (existingItem) {
      // Update existing item with new file
      console.log(`[Upload] Updating existing item at order ${order}, ID: ${existingItem.id}`);
      newItem = await imageItemService.updateImageItem(existingItem.id, {
        fileName: file.name,
        fileData: { base64: base64Data }
      });

      // Clear existing OCR text since we have a new image
      if (existingItem.ocrText) {
        console.log(`[Upload] Clearing OCR text for updated item`);
        await imageItemService.updateImageItemOcrText(existingItem.id, '');
        newItem = { ...newItem, ocrText: '' };
      }
    } else {
      // Create new image item
      console.log(`[Upload] Creating new item at order ${order}`);
      newItem = await imageItemService.createImageItem({
        fileName: file.name,
        fileData: { base64: base64Data },
        order: order,
        imageListId: id!,
      });
    }

    // Automatically update local state
    handleImageUploaded(newItem);

    // Return the created item for further processing
    return newItem;
  }, [id, imageItems, handleImageUploaded]);

  const handleImageOcrAnalysis = useCallback(async (order: number, base64Data: string, imageItem?: ImageItem): Promise<void> => {
    try {
      console.log(`[OCR] Starting OCR analysis for order ${order}, imageItem:`, imageItem ? `ID: ${imageItem.id}` : 'null');

      const ocrService = Apis.getOcrApi();
      const ocrResult = await ocrService.ocrFromBase64(base64Data);
      console.log(`[OCR] OCR analysis completed, result:`, ocrResult);

      // Extract text and update the image item
      const extractedText = ocrResult.boxes.map((box: any) => box.text).join(' ');
      console.log(`[OCR] Extracted text: "${extractedText}"`);

      // Use the provided imageItem or find by order
      if (imageItem) {
        console.log(`[OCR] Using provided imageItem for update`);
        await handleImageOcrTextUpdateById(imageItem.id, extractedText, order);
      } else {
        console.log(`[OCR] Falling back to order-based lookup`);
        await handleImageOcrTextUpdate(order, extractedText);
      }
    } catch (error) {
      console.error('[OCR] OCR analysis failed:', error);
      throw error;
    }
  }, []);

  const handleImageOcrTextUpdateById = useCallback(async (itemId: string, ocrText: string, order: number): Promise<void> => {
    try {
      console.log(`[OCR] Updating text for item ID ${itemId}, order ${order}, text: "${ocrText}"`);

      const imageItemService = Apis.getImageItemApi();

      // First, let's check the current item before updating
      console.log(`[OCR] About to call updateImageItemOcrText for item ${itemId}`);

      const updatedItem = await imageItemService.updateImageItemOcrText(itemId, ocrText);
      console.log(`[OCR] Successfully updated item with OCR text:`, updatedItem);
      console.log(`[OCR] Updated item OCR text:`, updatedItem.ocrText);

      // Automatically update local state with the updated item
      handleImageUploaded(updatedItem);

      // Also update the text state specifically (this ensures OCR text is reflected immediately)
      handleTextUpdated(order, ocrText);
      console.log(`[OCR] Local state updated for order ${order}`);
    } catch (error) {
      console.error('[OCR] OCR text update failed:', error);
      throw error;
    }
  }, [handleImageUploaded, handleTextUpdated]);

  const handleImageOcrTextUpdate = useCallback(async (order: number, ocrText: string): Promise<void> => {
    try {
      console.log(`[OCR] Updating text for order ${order}, text: "${ocrText}"`);
      console.log(`[OCR] Current imageItems count: ${imageItems.length}`);
      console.log(`[OCR] Current imageItems orders:`, imageItems.map(item => item.order));

      // Add a small delay to ensure state has been updated from the previous upload
      await new Promise(resolve => setTimeout(resolve, 100));

      // Find the image item by order
      let existingItem = imageItems.find(item => item.order === order);
      console.log(`[OCR] Found existingItem:`, existingItem ? `ID: ${existingItem.id}` : 'null');

      // If not found, try a few more times (race condition protection)
      if (!existingItem) {
        console.log(`[OCR] Item not found, retrying...`);
        for (let retry = 0; retry < 3; retry++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          existingItem = imageItems.find(item => item.order === order);
          console.log(`[OCR] Retry ${retry + 1}: Found existingItem:`, existingItem ? `ID: ${existingItem.id}` : 'null');
          if (existingItem) break;
        }
      }

      if (!existingItem) {
        console.error(`[OCR] No image item found for order ${order} after retries`);
        throw new Error(`No image item found for order ${order} after retries`);
      }

      const imageItemService = Apis.getImageItemApi();
      const updatedItem = await imageItemService.updateImageItemOcrText(existingItem.id, ocrText);
      console.log(`[OCR] Successfully updated item with OCR text:`, updatedItem.id);

      // Automatically update local state with the updated item
      handleImageUploaded(updatedItem);

      // Also update the text state specifically (this ensures OCR text is reflected immediately)
      handleTextUpdated(order, ocrText);
      console.log(`[OCR] Local state updated for order ${order}`);
    } catch (error) {
      console.error('OCR text update failed:', error);
      throw error;
    }
  }, [imageItems, handleImageUploaded, handleTextUpdated]);

  const handleImageCaptured = (file: File, position: number) => {
    // Store camera file for the specific position
    setCameraFiles(prev => ({
      ...prev,
      [position]: file
    }));
  };

  const clearCameraFile = useCallback((position: number) => {
    setCameraFiles(prev => {
      const updated = { ...prev };
      delete updated[position];
      return updated;
    });
  }, []);

  const renderImageGrid = () => {
    console.log("$$$$$$", Date.now(), "- renderImageGrid called");
    if (!imageListDetail) return null;

    const columns = imageListDetail.columns;
    const maxOrder = imageItems.length > 0 ? Math.max(...imageItems.map(item => item.order)) : -1;
    const minRequiredRows = imageItems.length > 0 ? Math.ceil((maxOrder + 1) / columns) : 1;
    const totalRows = minRequiredRows + additionalRows;
    const totalSlots = totalRows * columns;

    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      const existingItem = imageItems.find(item => item.order === i) || null;

      slots.push(
        <div key={i} style={{ minHeight: '180px' }}>
          <ImagePlaceholder
            order={i}
            imageListId={id!}
            existingItem={existingItem}
            cameraFile={cameraFiles[i]}
            onImageUpload={handleImageUpload}
            onImageOcrAnalysis={handleImageOcrAnalysis}
            onImageOcrTextUpdate={handleImageOcrTextUpdate}
            onImageDeleted={handleImageDeleted}
            onCameraFileProcessed={clearCameraFile}
            columns={columns}
          />
        </div>
      );
    }

    return (
      <div>
        <Alert
          message="提示"
          description="首次上传图片可能需要较长时间，请耐心等待。后续上传将会更快。"
          type="info"
          showIcon
          className={styles.alertContainer}
        />
        <div className={windowType === EWindowType.mobile ? styles.mobileActionsContainer : styles.actionsContainer}>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={downloadCsv}
            disabled={!imageItems.some(item => item.ocrText)}
          >
            下载文本
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={downloadGridCsv}
            disabled={!imageItems.some(item => item.ocrText)}
          >
            下载格式文本
          </Button>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addNewRow}
          >
            添加新行
          </Button>
          <Button
            type="primary"
            icon={<CameraOutlined />}
            onClick={() => setCameraModalVisible(true)}
          >
            批量拍照
          </Button>

        </div>
        {windowType === EWindowType.mobile ? (
          <div className={styles.mobileGrid}>
            <MobileImageGrid
              columns={columns}
              imageItems={imageItems}
              imageListId={id!}
              additionalRows={additionalRows}
              cameraFiles={cameraFiles}
              onImageUpload={handleImageUpload}
              onImageOcrAnalysis={handleImageOcrAnalysis}
              onImageOcrTextUpdate={handleImageOcrTextUpdate}
              onImageDeleted={handleImageDeleted}
              onCameraFileProcessed={clearCameraFile}
            />
          </div>
        ) : (
          <div
            className={styles.desktopGrid}
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '16px',
              width: '100%'
            }}
          >
            {slots}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={windowType === EWindowType.mobile ? styles.mobileContainer : styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/home')}
          style={{ marginRight: '16px' }}
        >
          返回
        </Button>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {imageListDetail?.name || '图片列表详情'}
        </span>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="详情" key="details">
          <Card>
            {imageListDetail && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="ID">{imageListDetail.id}</Descriptions.Item>
                <Descriptions.Item label="名称">{imageListDetail.name}</Descriptions.Item>
                <Descriptions.Item label="列数">{imageListDetail.columns}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </TabPane>
        <TabPane tab="图片" key="images">
          <Card>
            {imageLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : (
              renderImageGrid()
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Camera Modal */}
      <CameraModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        imageListId={id!}
        columns={imageListDetail?.columns || 1}
        startPosition={0}
        onImageCaptured={handleImageCaptured}
      />
    </div>
  );
};

export default ImageListDetail;