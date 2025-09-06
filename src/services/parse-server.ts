'use client';

// import { EPositionType, GymAction, GymRecord, IMediaFilter } from '@/typings/action';
import Parse from 'parse';
import { EMediaType, IMediaFilter, MediaHash } from '@/typings/media';

// For development: .env.local
// Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY");
Parse.initialize(
  process.env.REACT_APP_PARSE_APP_ID || 'jitsi',
  process.env.REACT_APP_PARSE_JAVASCRIPT_KEY,
);
//javascriptKey is required only if you have it on server.
Parse.serverURL = process.env.REACT_APP_PARSE_SERVER_URL || '';

const newObject = (className: string) => {
  const Collection = Parse.Object.extend(className);
  return new Collection();
};

const newPointer = (className: string, id: string) => {
  const Collection = Parse.Object.extend(className);
  const relation = new Collection();
  relation.id = id;
  return relation;
};

const applyPagination = (query: Parse.Query, pageNum: number, pageSize: number) => {
  const size = pageSize || 20;
  if (query && pageNum && pageNum >= 0) {
    query.skip((pageNum - 1) * size);
    query.limit(size);
  }
};

const applyFilters = (query: Parse.Query, filters: IMediaFilter) => {
  if (filters) {
    const { startAt, endAt } = filters;

    if (startAt) {
      query.greaterThanOrEqualTo('createdAt', new Date(startAt));
    }

    if (endAt) {
      query.lessThanOrEqualTo('createdAt', new Date(endAt));
    }
  }
  return query;
};

const findAsync = async (query: Parse.Query) => {
  const rawList = await query.find();
  console.log('Successfully retrieved ' + rawList.length);
  return rawList;
};

export const countRecords = (filters: IMediaFilter) => {
  const query = new Parse.Query(MediaHash);
  if (filters) {
    applyFilters(query, filters);
  }
  return query.count();
};

export const login = async (username: string, password: string) => {
  console.log(
    `AppID: ${process.env.REACT_APP_PARSE_APP_ID}, Server: ${process.env.REACT_APP_PARSE_SERVER_URL}`,
  );
  return await Parse.User.logIn(username, password);
};

export const signup = async (username: string, password: string) => {
  console.log(
    `AppID: ${process.env.REACT_APP_PARSE_APP_ID}, Server: ${process.env.REACT_APP_PARSE_SERVER_URL}`,
  );
  return await Parse.User.signUp(username, password, {});
};

export const getCurrentUser = () => {
  const user = Parse.User.current();
  return user;
};

export const createMediaHash = async ({
  hash,
  name,
  type,
  fileName,
  fileData,
}: {
  type: EMediaType;
  hash: string;
  name?: string;
  fileName?: string;
  fileData: { base64: string } | Array<number> | Blob | File;
}) => {
  const query = newObject('MediaHash') as MediaHash;
  query.set('name', name);
  query.set('type', type);
  query.set('hash', hash);
  // Create a new ACL object
  const acl = new Parse.ACL();
  const currentUser = Parse.User.current();
  if (currentUser) {
    acl.setReadAccess(currentUser, true);
    acl.setWriteAccess(currentUser, true);
  }

  // Assign the ACL to the MediaHash object
  query.setACL(acl);

  // Create a new ParseFile instance
  const defaultFileName = currentUser
    ? `${currentUser.id}_${hash.substring(0, 6)}.${type}`
    : `${hash}.${type}`;
  const fn = fileName || defaultFileName;
  const parseFile = new Parse.File(fn, fileData);

  try {
    // Save the ParseFile instance
    await parseFile.save();

    // Set the file to the MediaHash object
    query.set('file', parseFile);

    // Save the MediaHash object
    return await query.save();
  } catch (error) {
    console.error('Error saving ParseFile:', error);
    throw error;
  }
};
export const getMediaHash = async () => {
  const query = new Parse.Query(MediaHash);
  query.descending('name');
  const rawList = await query.find();
  console.log('Successfully retrieved ' + rawList.length);
  return rawList;
};

export const getMediaHashByMd5 = async (md5: string) => {
  const query = new Parse.Query(MediaHash);
  query.equalTo('hash', md5);
  const raw = await query.find();
  console.log('Successfully retrieved ' + raw);
  return raw.length > 0 ? raw[0] : null;
};

export const getMediaHashById = async (id: string) => {
  const query = new Parse.Query(MediaHash);
  query.equalTo('objectId', id);
  query.include('file'); // Include the file field
  const raw = await query.find();
  console.log('Successfully retrieved ' + raw);
  return raw.length > 0 ? raw[0] : null;
};

export const getMediaHashAndCount = (
  pageIndex: number,
  pageSize: number,
  filters?: IMediaFilter,
) => {
  const query = new Parse.Query(MediaHash);
  query.descending('createdAt');
  if (filters) {
    applyFilters(query, filters);
  }
  applyPagination(query, pageIndex, pageSize);
  return findAsync(query);
};

const deleteRecord = (id: string, name: string) => {
  const query = newPointer(name, id);
  return query.destroy();
};

export const deleteMediaHash = async (id: string) => {
  return deleteRecord(id, 'MediaHash');
};
