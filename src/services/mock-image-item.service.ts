import { ImageItem, ImageItemService } from './image-item.service';

export class MockImageItemService extends ImageItemService {
  private mockData: ImageItem[] = [];

  async getImageItemsByListId(imageListId: string): Promise<ImageItem[]> {
    return this.mockData.filter(item => item.imageListId === imageListId);
  }

  async createImageItem(data: {
    fileName: string;
    fileData: { base64: string };
    order: number;
    imageListId: string;
  }): Promise<ImageItem> {
    const newItem: ImageItem = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: data.fileName,
      file: null,
      fileUrl: `data:image/jpeg;base64,${data.fileData.base64}`,
      order: data.order,
      imageListId: data.imageListId,
      ocrText: undefined,
    };

    this.mockData.push(newItem);
    return newItem;
  }

  async updateImageItemOcrText(id: string, ocrText: string): Promise<ImageItem> {
    const itemIndex = this.mockData.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('ImageItem not found');
    }

    this.mockData[itemIndex].ocrText = ocrText;
    return this.mockData[itemIndex];
  }

  async deleteImageItem(id: string): Promise<void> {
    const itemIndex = this.mockData.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      this.mockData.splice(itemIndex, 1);
    }
  }

  async updateImageItem(id: string, data: {
    fileName?: string;
    fileData?: { base64: string };
  }): Promise<ImageItem> {
    const itemIndex = this.mockData.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('ImageItem not found');
    }

    if (data.fileName) {
      this.mockData[itemIndex].fileName = data.fileName;
    }

    if (data.fileData) {
      this.mockData[itemIndex].fileUrl = `data:image/jpeg;base64,${data.fileData.base64}`;
    }

    return this.mockData[itemIndex];
  }
}
