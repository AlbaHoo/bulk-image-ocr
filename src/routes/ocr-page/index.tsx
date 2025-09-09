import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Apis } from '@/services';
import { ImageListItem } from '@/services/image-list.service';

const OcrPage: React.FC = () => {
  const [imageList, setImageList] = useState<ImageListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const navigate = useNavigate();
  const imageListService = Apis.getImageListApi();

  const fetchImageList = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const result = await imageListService.getImageLists(page, pageSize);

      setImageList(result.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: result.total,
      }));
    } catch (error) {
      message.error('获取图片列表失败');
      console.error('Error fetching image list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageList();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchImageList(pagination.current, pagination.pageSize);
  };

  const handleCreateImageList = async (values: { name: string; columns: number }) => {
    try {
      await imageListService.createImageList(values);

      message.success('图片列表创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchImageList(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('创建图片列表失败');
      console.error('Error creating image list:', error);
    }
  };

  const handleDeleteImageList = async (id: string, name: string) => {
    setLoading(true);
    try {
      await imageListService.deleteImageList(id);
      message.success(`已成功删除图片列表"${name}"及其所有相关数据`);
      fetchImageList(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败，请重试');
      console.error('Error deleting image list:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ImageListItem) => (
        <Button
          type="link"
          onClick={() => navigate(`/image-list/${record.id}`)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '列数',
      dataIndex: 'columns',
      key: 'columns',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: ImageListItem) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/image-list/${record.id}`)}
            style={{ padding: 0 }}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个图片列表吗？这将删除列表中的所有图片和相关数据，此操作不可撤销。"
            onConfirm={() => handleDeleteImageList(record.id, record.name)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>图片列表</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          新建
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={imageList}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="新建图片列表"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateImageList}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称！' }]}
          >
            <Input placeholder="请输入图片列表名称" />
          </Form.Item>

          <Form.Item
            label="列数"
            name="columns"
            rules={[{ required: true, message: '请输入列数！' }]}
          >
            <InputNumber
              min={1}
              placeholder="请输入列数"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OcrPage;