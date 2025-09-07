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
    try {
      const ImageItemClass = this.getImageItemClass();
      const ImageListClass = this.getImageListClass();

      const imageListPointer = new ImageListClass();
      imageListPointer.id = imageListId;

      const query = new Parse.Query(ImageItemClass);
      query.equalTo('imageList', imageListPointer);

      // Try to filter by user for new records, but don't require it for backward compatibility
      const currentUser = Parse.User.current();
      console.log('Current user:', currentUser?.id);

      // For now, comment out user filtering to allow access to existing records
      // TODO: Add migration to set user field on existing records
      // if (currentUser) {
      //   query.equalTo('user', currentUser);
      // }

      query.ascending('order');

      console.log('Fetching ImageItems for list:', imageListId);
      const results = await query.find();
      console.log('Found ImageItems:', results.length);

      return results.map(item => ({
        id: item.id,
        fileName: item.get('fileName'),
        file: item.get('file'),
        fileUrl: item.get('file')?.url(),
        order: item.get('order'),
        imageListId: imageListId,
        ocrText: item.get('ocrText'),
      }));
    } catch (error) {
      console.error('Error fetching ImageItems:', error);
      throw error;
    }
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

    // Create a new ACL object
    const acl = new Parse.ACL();
    const currentUser = Parse.User.current();
    if (currentUser) {
      acl.setReadAccess(currentUser, true);
      acl.setWriteAccess(currentUser, true);
      // Also set user pointer for query filtering
      imageItem.set('user', currentUser);
    }

    // Assign the ACL to the ImageItem object
    imageItem.setACL(acl);

    const savedItem = await imageItem.save();    return {
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
    const imageItem = new ImageItemClass();
    imageItem.id = id;

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
    const imageItem = new ImageItemClass();
    imageItem.id = id;
    imageItem.set('ocrText', ocrText);

    const savedItem = await imageItem.save();

    return {
      id: savedItem.id,
      fileName: savedItem.get('fileName'),
      file: savedItem.get('file'),
      fileUrl: savedItem.get('file')?.url(),
      order: savedItem.get('order'),
      imageListId: savedItem.get('imageList')?.id,
      ocrText: savedItem.get('ocrText'),
    };
  }
}
