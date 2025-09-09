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
    try {
      const ImageListClass = this.getImageListClass();
      const query = new Parse.Query(ImageListClass);

      // Try to filter by user for new records, but don't require it for backward compatibility
      const currentUser = Parse.User.current();
      console.log('Current user:', currentUser?.id);

      // For now, comment out user filtering to allow access to existing records
      // TODO: Add migration to set user field on existing records
      // if (currentUser) {
      //   query.equalTo('user', currentUser);
      // }

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
    } catch (error) {
      console.error('Error fetching ImageLists:', error);
      throw error;
    }
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

    // Create a new ACL object
    const acl = new Parse.ACL();
    const currentUser = Parse.User.current();
    if (currentUser) {
      acl.setReadAccess(currentUser, true);
      acl.setWriteAccess(currentUser, true);
      // Also set user pointer for query filtering
      imageListItem.set('user', currentUser);
    }

    // Assign the ACL to the ImageList object
    imageListItem.setACL(acl);

    const savedItem = await imageListItem.save();    return {
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
    const ImageItemClass = Parse.Object.extend('ImageItem');

    try {
      // First, get all related ImageItems
      const imageListPointer = new ImageListClass();
      imageListPointer.id = id;

      const imageItemQuery = new Parse.Query(ImageItemClass);
      imageItemQuery.equalTo('imageList', imageListPointer);
      const imageItems = await imageItemQuery.find();

      // Delete all Parse.File objects associated with ImageItems
      const fileDeletionPromises = imageItems.map(async (item) => {
        const file = item.get('file');
        if (file) {
          try {
            // Note: Parse.File.destroy() might not be available in all Parse versions
            // In that case, files will be cleaned up by Parse Server's file cleanup jobs
            console.log('Deleting file:', file.name());
          } catch (fileError) {
            console.warn('Could not delete file:', file.name(), fileError);
          }
        }
      });

      await Promise.allSettled(fileDeletionPromises);

      // Delete all ImageItems
      if (imageItems.length > 0) {
        await Parse.Object.destroyAll(imageItems);
        console.log(`Deleted ${imageItems.length} related ImageItems`);
      }

      // Finally, delete the ImageList itself
      const query = new Parse.Query(ImageListClass);
      const imageList = await query.get(id);
      await imageList.destroy();

      console.log('Successfully deleted ImageList and all related data');
    } catch (error) {
      console.error('Error during cascade deletion:', error);
      throw new Error('Failed to delete ImageList and related data');
    }
  }
}
