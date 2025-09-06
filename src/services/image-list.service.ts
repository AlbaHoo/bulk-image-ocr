import Parse from 'parse';

export interface ImageListItem {
  id: string;
  name: string;
  columns: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export class ImageListService {
  private getImageListClass() {
    return Parse.Object.extend('ImageList');
  }

  async getImageLists(page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ImageListItem>> {
    const ImageListClass = this.getImageListClass();
    const query = new Parse.Query(ImageListClass);

    // Set pagination
    query.skip((page - 1) * pageSize);
    query.limit(pageSize);

    // Get total count
    const totalCount = await query.count();

    // Get results
    const results = await query.find();

    const data = results.map(item => ({
      id: item.id,
      name: item.get('name'),
      columns: item.get('columns'),
    }));

    return {
      data,
      total: totalCount,
    };
  }

  async getImageListById(id: string): Promise<ImageListItem> {
    const ImageListClass = this.getImageListClass();
    const query = new Parse.Query(ImageListClass);
    const imageList = await query.get(id);

    return {
      id: imageList.id,
      name: imageList.get('name'),
      columns: imageList.get('columns'),
    };
  }

  async createImageList(data: { name: string; columns: number }): Promise<ImageListItem> {
    const ImageListClass = this.getImageListClass();
    const imageListItem = new ImageListClass();

    imageListItem.set('name', data.name);
    imageListItem.set('columns', data.columns);

    const savedItem = await imageListItem.save();

    return {
      id: savedItem.id,
      name: savedItem.get('name'),
      columns: savedItem.get('columns'),
    };
  }

  async updateImageList(id: string, data: { name?: string; columns?: number }): Promise<ImageListItem> {
    const ImageListClass = this.getImageListClass();
    const query = new Parse.Query(ImageListClass);
    const imageList = await query.get(id);

    if (data.name !== undefined) {
      imageList.set('name', data.name);
    }
    if (data.columns !== undefined) {
      imageList.set('columns', data.columns);
    }

    const savedItem = await imageList.save();

    return {
      id: savedItem.id,
      name: savedItem.get('name'),
      columns: savedItem.get('columns'),
    };
  }

  async deleteImageList(id: string): Promise<void> {
    const ImageListClass = this.getImageListClass();
    const query = new Parse.Query(ImageListClass);
    const imageList = await query.get(id);

    await imageList.destroy();
  }
}
