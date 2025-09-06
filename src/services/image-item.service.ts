import Parse from 'parse';

export interface ImageItem {
  id: string;
  fileName: string;
  file: Parse.File;
  fileUrl?: string;
  order: number;
  imageListId: string;
  ocrText?: string;
}

export class ImageItemService {
  private getImageItemClass() {
    return Parse.Object.extend('ImageItem');
  }

  private getImageListClass() {
    return Parse.Object.extend('ImageList');
  }

  async getImageItemsByListId(imageListId: string): Promise<ImageItem[]> {
    const ImageItemClass = this.getImageItemClass();
    const ImageListClass = this.getImageListClass();

    const imageListPointer = new ImageListClass();
    imageListPointer.id = imageListId;

    const query = new Parse.Query(ImageItemClass);
    query.equalTo('imageList', imageListPointer);
    query.ascending('order');

    const results = await query.find();

    return results.map(item => ({
      id: item.id,
      fileName: item.get('fileName'),
      file: item.get('file'),
      fileUrl: item.get('file')?.url(),
      order: item.get('order'),
      imageListId: imageListId,
      ocrText: item.get('ocrText'),
    }));
  }

  async createImageItem(data: {
    fileName: string;
    fileData: { base64: string };
    order: number;
    imageListId: string;
  }): Promise<ImageItem> {
    const ImageItemClass = this.getImageItemClass();
    const ImageListClass = this.getImageListClass();

    const imageListPointer = new ImageListClass();
    imageListPointer.id = data.imageListId;

    const file = new Parse.File(data.fileName, { base64: data.fileData.base64 });
    await file.save();

    const imageItem = new ImageItemClass();
    imageItem.set('fileName', data.fileName);
    imageItem.set('file', file);
    imageItem.set('order', data.order);
    imageItem.set('imageList', imageListPointer);

    const savedItem = await imageItem.save();

    return {
      id: savedItem.id,
      fileName: savedItem.get('fileName'),
      file: savedItem.get('file'),
      fileUrl: savedItem.get('file')?.url(),
      order: savedItem.get('order'),
      imageListId: data.imageListId,
      ocrText: savedItem.get('ocrText'),
    };
  }

  async deleteImageItem(id: string): Promise<void> {
    const ImageItemClass = this.getImageItemClass();
    const query = new Parse.Query(ImageItemClass);
    const imageItem = await query.get(id);

    await imageItem.destroy();
  }

  async updateImageItem(id: string, data: {
    fileName?: string;
    fileData?: { base64: string };
  }): Promise<ImageItem> {
    const ImageItemClass = this.getImageItemClass();
    const query = new Parse.Query(ImageItemClass);
    const imageItem = await query.get(id);

    if (data.fileName) {
      imageItem.set('fileName', data.fileName);
    }

    if (data.fileData) {
      const file = new Parse.File(data.fileName || imageItem.get('fileName'), { base64: data.fileData.base64 });
      await file.save();
      imageItem.set('file', file);
    }

    const savedItem = await imageItem.save();

    return {
      id: savedItem.id,
      fileName: savedItem.get('fileName'),
      file: savedItem.get('file'),
      fileUrl: savedItem.get('file')?.url(),
      order: savedItem.get('order'),
      imageListId: imageItem.get('imageList').id,
      ocrText: savedItem.get('ocrText'),
    };
  }

  async updateImageItemOcrText(id: string, ocrText: string): Promise<ImageItem> {
    const ImageItemClass = this.getImageItemClass();
    const query = new Parse.Query(ImageItemClass);
    const imageItem = await query.get(id);

    imageItem.set('ocrText', ocrText);
    const savedItem = await imageItem.save();

    return {
      id: savedItem.id,
      fileName: savedItem.get('fileName'),
      file: savedItem.get('file'),
      fileUrl: savedItem.get('file')?.url(),
      order: savedItem.get('order'),
      imageListId: savedItem.get('imageList').id,
      ocrText: savedItem.get('ocrText'),
    };
  }
}
