import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message, Space, Typography, Upload } from 'antd';
import { CloseOutlined, CameraOutlined, ReloadOutlined, ArrowRightOutlined, UploadOutlined } from '@ant-design/icons';
import { Apis } from '@/services';
import { ImageItem } from '@/services/image-item.service';

const { Title, Text } = Typography;

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  imageListId: string;
  columns: number;
  startPosition?: number;
  onImageUploaded: (item: ImageItem) => void;
}

type CameraState = 'idle' | 'camera' | 'video-ready' | 'captured' | 'uploading';

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  imageListId,
  columns,
  startPosition = 0,
  onImageUploaded,
}) => {
  const [currentPosition, setCurrentPosition] = useState(startPosition);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate row and column from position
  const rowIndex = Math.floor(currentPosition / columns) + 1;
  const columnIndex = (currentPosition % columns) + 1;

  // Initialize camera when modal opens
  useEffect(() => {
    if (visible) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [visible]);

  // Reset position when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentPosition(startPosition);
      setCameraState('idle');
      setCapturedImage(null);
      setVideoReady(false);
    }
  }, [visible, startPosition]);

  // Reconnect stream when returning to camera state
  useEffect(() => {
    if (cameraState === 'camera' && stream && !videoReady) {
      // Wait for video element to be available, then reconnect
      const reconnectStream = () => {
        if (videoRef.current && stream) {
          setupVideoElement(stream);
        } else if (stream) {
          setTimeout(reconnectStream, 100);
        }
      };

      reconnectStream();
    }
  }, [cameraState, stream, videoReady]);

  const setupVideoElement = (mediaStream: MediaStream) => {
    if (videoRef.current) {
      // Reset video element properties
      videoRef.current.srcObject = null;
      videoRef.current.load();

      // Set important video properties
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
      videoRef.current.muted = true; // Required for autoplay in many browsers

      // Wait a moment then set the stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          // Add event listeners
          videoRef.current.onloadedmetadata = () => {
            setTimeout(() => checkVideoReady(), 100);
          };

          videoRef.current.oncanplay = () => {
            setTimeout(() => checkVideoReady(), 100);
          };

          videoRef.current.onplaying = () => {
            setTimeout(() => checkVideoReady(), 200);
          };

          videoRef.current.onloadeddata = () => {
            setTimeout(() => checkVideoReady(), 100);
          };

          videoRef.current.onerror = (e) => {
            console.error('Video error:', e);
            setVideoReady(false);
          };

          // Force video to load
          videoRef.current.load();

          // Multiple attempts to play the video
          const attemptPlay = async (attempt = 1) => {
            if (videoRef.current && attempt <= 5) {
              try {
                await videoRef.current.play();

                // Check readiness multiple times
                setTimeout(() => checkVideoReady(), 300);
                setTimeout(() => checkVideoReady(), 800);
                setTimeout(() => checkVideoReady(), 1500);
                setTimeout(() => checkVideoReady(), 3000);

              } catch (playError) {
                if (attempt < 5) {
                  setTimeout(() => attemptPlay(attempt + 1), 500);
                } else {
                  // Set up click handler for manual activation
                  if (videoRef.current) {
                    videoRef.current.onclick = () => {
                      forceVideoPlay();
                    };
                  }
                }
              }
            }
          };

          // Start playing attempts after a delay
          setTimeout(() => attemptPlay(), 500);
        }
      }, 100);
    }
  };

  const initializeCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });

      setStream(mediaStream);

      // Wait for stream to be fully active before setting to video element
      const waitForStreamReady = () => {
        const videoTracks = mediaStream.getVideoTracks();
        if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
          // Wait for video element to be available in the DOM
          const waitForVideoElement = () => {
            if (videoRef.current) {
              setupVideoElement(mediaStream);
            } else {
              setTimeout(waitForVideoElement, 100);
            }
          };

          waitForVideoElement();
        } else {
          setTimeout(waitForStreamReady, 100);
        }
      };

      waitForStreamReady();

      // Set camera state immediately after getting stream
      setCameraState('camera');

    } catch (error) {
      console.error('Camera access failed:', error);
      message.error('无法访问摄像头，请使用文件上传');
      setCameraState('idle');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const checkVideoReady = () => {
    if (videoRef.current) {
      const video = videoRef.current;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoReady(true);
        setCameraState('video-ready');
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  const forceVideoPlay = async () => {
    if (videoRef.current && stream) {
      try {
        // Ensure the stream is attached
        videoRef.current.srcObject = stream;
        videoRef.current.load();

        // Wait a bit for loading
        await new Promise(resolve => setTimeout(resolve, 200));

        await videoRef.current.play();

        // Check readiness multiple times with increasing delays
        setTimeout(() => checkVideoReady(), 300);
        setTimeout(() => checkVideoReady(), 800);
        setTimeout(() => checkVideoReady(), 1500);

      } catch (error) {
        console.error('Manual video play failed:', error);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready - dimensions are 0');
      message.error('摄像头未就绪，请稍后再试');
      return;
    }

    console.log('Capturing photo - video dimensions:', video.videoWidth, 'x', video.videoHeight);

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.87);
      if (imageData === 'data:,') {
        console.error('Canvas is empty');
        message.error('拍照失败，请重试');
        return;
      }

      console.log('Photo captured successfully');
      setCapturedImage(imageData);
      setCameraState('captured');
    } catch (error) {
      console.error('Failed to capture photo:', error);
      message.error('拍照失败，请重试');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVideoReady(false); // Reset video ready state
    setCameraState('camera');
  };

  const resizeImageForOCR = async (base64Data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');

      img.onload = () => {
        const MAX_DIMENSION = 1600;
        let { width, height } = img;

        const longerSide = Math.max(width, height);
        let scaleFactor = 1;

        if (longerSide > MAX_DIMENSION) {
          scaleFactor = MAX_DIMENSION / longerSide;
        }

        const newWidth = Math.round(width * scaleFactor);
        const newHeight = Math.round(height * scaleFactor);

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.87);
          const resizedBase64Data = resizedBase64.split(',')[1];
          resolve(resizedBase64Data);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = base64Data;
    });
  };

  const uploadAndNext = async () => {
    if (!capturedImage) return;

    setCameraState('uploading');

    try {
      // Extract base64 data and resize for OCR
      const base64Data = await resizeImageForOCR(capturedImage);

      // Upload image
      const imageItemService = Apis.getImageItemApi();
      const fileName = `camera-${Date.now()}.jpg`;

      const newItem = await imageItemService.createImageItem({
        fileName,
        fileData: { base64: base64Data },
        order: currentPosition,
        imageListId,
      });

      // Update grid immediately
      onImageUploaded(newItem);
      message.success(`位置 [${rowIndex},${columnIndex}] 上传成功`);

      // Start OCR in background
      const ocrService = Apis.getOcrApi();
      ocrService.ocrFromBase64(base64Data)
        .then(ocrResult => {
          const extractedText = ocrResult.boxes.map(box => box.text).join(' ');
          return imageItemService.updateImageItemOcrText(newItem.id, extractedText);
        })
        .then(updatedItem => {
          // Update grid with OCR text
          onImageUploaded(updatedItem);
          message.success(`位置 [${rowIndex},${columnIndex}] 文字识别完成`);
        })
        .catch(error => {
          console.error('OCR failed:', error);
          message.error('文字识别失败');
        });

      // Move to next position
      setCurrentPosition(prev => prev + 1);
      setCapturedImage(null);
      setVideoReady(false); // Reset video ready state
      setCameraState('camera');

    } catch (error) {
      console.error('Upload failed:', error);
      message.error('上传失败');
      setCameraState('captured');
    }
  };

  const handleFileUpload = async (file: File) => {
    setCameraState('uploading');

    try {
      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64 = result?.split(',')[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
      });

      // Resize for OCR
      const resizedBase64 = await resizeImageForOCR(`data:image/jpeg;base64,${base64Data}`);

      // Upload image
      const imageItemService = Apis.getImageItemApi();
      const newItem = await imageItemService.createImageItem({
        fileName: file.name,
        fileData: { base64: resizedBase64 },
        order: currentPosition,
        imageListId,
      });

      // Update grid immediately
      onImageUploaded(newItem);
      message.success(`位置 [${rowIndex},${columnIndex}] 上传成功`);

      // Start OCR in background
      const ocrService = Apis.getOcrApi();
      ocrService.ocrFromBase64(resizedBase64)
        .then(ocrResult => {
          const extractedText = ocrResult.boxes.map(box => box.text).join(' ');
          return imageItemService.updateImageItemOcrText(newItem.id, extractedText);
        })
        .then(updatedItem => {
          onImageUploaded(updatedItem);
          message.success(`位置 [${rowIndex},${columnIndex}] 文字识别完成`);
        })
        .catch(error => {
          console.error('OCR failed:', error);
          message.error('文字识别失败');
        });

      // Move to next position
      setCurrentPosition(prev => prev + 1);
      setCameraState('camera');

    } catch (error) {
      console.error('Upload failed:', error);
      message.error('上传失败');
      setCameraState('idle');
    }
  };

  const renderContent = () => {
    if (cameraState === 'idle') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>
          <Text>正在初始化摄像头...</Text>
          <div style={{ marginTop: '20px' }}>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false;
              }}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                或选择文件上传
              </Button>
            </Upload>
          </div>
        </div>
      );
    }

    if (cameraState === 'camera' || cameraState === 'video-ready') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                borderRadius: '8px',
                backgroundColor: '#000',
                minHeight: '200px',
                cursor: 'pointer'
              }}
              autoPlay
              playsInline
              muted
              controls={false}
              onClick={() => {
                // Allow user to click video to start playback if auto-play failed
                if (videoRef.current) {
                  videoRef.current.play().then(() => {
                    setTimeout(() => {
                      if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                        setVideoReady(true);
                        setCameraState('video-ready');
                      }
                    }, 500);
                  }).catch(console.error);
                }
              }}
            />
            {/* Show loading overlay if video hasn't started or has no dimensions */}
            {!videoReady && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <div>摄像头准备中...</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  如果黑屏，请点击此处启动摄像头
                </div>
              </div>
            )}
            {/* Show ready indicator */}
            {videoReady && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: 'rgba(82, 196, 26, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                摄像头就绪
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={capturePhoto}
                disabled={!videoReady}
              >
                {videoReady ? '拍照' : '等待摄像头就绪...'}
              </Button>
              {!videoReady && (
                <Button
                  type="default"
                  size="large"
                  onClick={forceVideoPlay}
                >
                  手动启动摄像头
                </Button>
              )}
              <Button
                type="default"
                size="small"
                onClick={checkVideoReady}
              >
                检查状态
              </Button>
            </Space>
          </div>
        </div>
      );
    }

    if (cameraState === 'captured') {
      return (
        <div style={{ textAlign: 'center' }}>
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          )}
          <div style={{ marginTop: '20px' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={retakePhoto}
              >
                重拍
              </Button>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={uploadAndNext}
              >
                下一张
              </Button>
            </Space>
          </div>
        </div>
      );
    }

    if (cameraState === 'uploading') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text>正在上传...</Text>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              当前位置: [行 {rowIndex}, 列 {columnIndex}]
            </Title>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ border: 'none', boxShadow: 'none' }}
            />
          </div>
        }
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={500}
        centered
        closable={false}
        destroyOnClose
      >
        {renderContent()}
      </Modal>
    </>
  );
};

export default CameraModal;
