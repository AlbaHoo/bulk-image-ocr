import { ImageListItem, PaginatedResult, ImageListService } from './image-list.service';

export class MockImageListService extends ImageListService {
  private mockData: ImageListItem[] = [
    { id: '1', name: 'Sample List 1', columns: 3 },
    { id: '2', name: 'Sample List 2', columns: 5 },
    { id: '3', name: 'Sample List 3', columns: 2 },
  ];

  async getImageLists(page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ImageListItem>> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = this.mockData.slice(startIndex, endIndex);

    return {
      data,
      total: this.mockData.length,
    };
  }

  async getImageListById(id: string): Promise<ImageListItem> {
    const item = this.mockData.find(item => item.id === id);
    if (!item) {
      throw new Error('ImageList not found');
    }
    return item;
  }

  async createImageList(data: { name: string; columns: number }): Promise<ImageListItem> {
    const newItem: ImageListItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      columns: data.columns,
    };

    this.mockData.push(newItem);
    return newItem;
  }

  async updateImageList(id: string, data: { name?: string; columns?: number }): Promise<ImageListItem> {
    const itemIndex = this.mockData.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('ImageList not found');
    }

    if (data.name !== undefined) {
      this.mockData[itemIndex].name = data.name;
    }
    if (data.columns !== undefined) {
      this.mockData[itemIndex].columns = data.columns;
    }

    return this.mockData[itemIndex];
  }

  async deleteImageList(id: string): Promise<void> {
    const itemIndex = this.mockData.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('ImageList not found');
    }

    this.mockData.splice(itemIndex, 1);
  }
}
