import React, { useState, useEffect } from 'react';
import { Card, Tabs, Descriptions, Button, message, Spin, Row, Col, Space, Alert } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Apis } from '../../services';
import { ImageListItem } from '../../services/image-list.service';
import { ImageItem } from '../../services/image-item.service';
import ImagePlaceholder from '../../components/ImagePlaceholder';

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

  const renderImageGrid = () => {
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
        <Col span={24 / columns} key={i}>
          <ImagePlaceholder
            order={i}
            imageListId={id!}
            existingItem={existingItem}
            onImageUploaded={handleImageUploaded}
            onImageDeleted={handleImageDeleted}
            onTextUpdated={handleTextUpdated}
          />
        </Col>
      );
    }

    return (
      <div>
        <Alert
          message="提示"
          description="首次上传图片可能需要较长时间，请耐心等待。后续上传将会更快。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Space>
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
          </Space>
        </div>
        <Row gutter={[16, 16]}>
          {slots}
        </Row>
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
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
    </div>
  );
};

export default ImageListDetail;