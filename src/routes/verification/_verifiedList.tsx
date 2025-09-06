import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Modal, Spin, Table, Tag } from 'antd';
import { IMedia } from 'services/media.interface';
import { Apis } from 'services';
import { getSignature, url2base64 } from 'utils/image';

interface IPropTypes {
  containerHeight: number;
}

const PAGE_SIZE = 10;

export default function VerifiedList(props: IPropTypes) {
  const [mediaList, setMediaList] = useState<IMedia[]>(null);
  const [loading, setLoading] = useState(false);
  const [mediaId, setMediaId] = useState<string>();
  const [url, setUrl] = useState<string>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const handleDeleteMediaHash = async (id: string) => {
    await Apis.getMediaApi().deleteHash(id);
    message.success('Successfully deleted media hash');
    const newMediaList = mediaList.filter((item) => item.id !== id);
    setMediaList(newMediaList);
  };

  const handleSelectImage = async (id: string) => {
    setMediaId(id);
    setLoadingImage(true);
    const url = await Apis.getMediaApi().getMedia(id);
    if (url) {
      setUrl(url);
      const base64 = await url2base64(url);
      const sig = await getSignature(base64, 'png');
      setSignature(sig);
    } else {
      message.error('Not image found');
    }
    setLoadingImage(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180,
      render: (id: string) => id,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      render: (record: IMedia) => <Tag>PNG</Tag>,
    },
    {
      title: 'Hash',
      key: 'hash',
      dataIndex: 'hash',
      render: (hash: string) => hash || '-',
    },
    {
      title: 'Action',
      key: 'actions',
      width: 180,
      render: (record: IMedia) => {
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              style={{ color: '#ff4d4f' }}
              type="link"
              ghost
              size="small"
              onClick={() =>
                Modal.confirm({
                  title: 'Are you sure you want to delete this record?',
                  okText: 'Yes',
                  okType: 'danger',
                  cancelText: 'No',
                  onOk: () => handleDeleteMediaHash(record.id),
                })
              }
            >
              Delete
            </Button>
            {record.fileUrl && (
              <Button type="link" ghost size="small" onClick={() => handleSelectImage(record.id)}>
                View
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    Apis.getMediaApi()
      .getMediaList({ pageIndex: 1, pageSize: PAGE_SIZE })
      .then((data) => {
        setMediaList(data);
      })
      .catch((error) => {
        message.error('Failed to get verified media list' + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {mediaList?.length > 0 ? (
        <Table
          rowKey="id"
          size="small"
          loading={loading}
          dataSource={mediaList}
          columns={columns}
        />
      ) : null}

      <Modal
        title="Image"
        visible={Boolean(mediaId)}
        onCancel={() => {
          setMediaId(null);
          setUrl(null);
        }}
        onOk={() => {
          setMediaId(null);
          setUrl(null);
        }}
      >
        <Spin spinning={loadingImage}>
          <img ref={imgRef} src={url} width={200} alt="Loaded" />
          {signature && <textarea value={signature} readOnly rows={10} cols={50} />}
        </Spin>
      </Modal>
    </div>
  );
}
