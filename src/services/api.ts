import axios from 'axios';
import { APIFunctionError } from '@/utils/error';
import { IMfaRequiredResult, IAuthorizeAgentResponse } from '@/typings/auth';

const LWS_SERVER_HOST = process.env.LWS_SERVER_HOST;

function isPlainObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

const DATE_STR_EX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
function transformResponseData(result: any) {
  let nextResult = result;
  if (typeof nextResult === 'string' && DATE_STR_EX.test(nextResult)) {
    nextResult = new Date(nextResult);
    return nextResult;
  }
  if (nextResult instanceof Array) {
    nextResult = result.map((item: any) => transformResponseData(item));
  }

  if (isPlainObject(nextResult)) {
    const objectResult = {};
    for (const property in nextResult) {
      if (Object.prototype.hasOwnProperty.call(nextResult, property)) {
        objectResult[property] = transformResponseData(nextResult[property]);
      }
    }
    nextResult = objectResult;
  }
  return nextResult;
}

async function execute(functionName: string, data = {}): Promise<any> {
  const reqURL = `${LWS_SERVER_HOST}/functions/${functionName}`;
  const jwtToken = 'jwt token';
  const newHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    authorization: '',
  };
  newHeaders.authorization = `Bearer ${jwtToken}`;

  const result = await axios.post(reqURL, data, {
    headers: newHeaders,
    validateStatus: null,
  });
  if (result.status >= 200 && result.status < 300 && !result.data.error) {
    return transformResponseData(result.data.data);
  }
  console.error(`Function[${functionName}] invocation error`, result);
  const error = new APIFunctionError(result.data.message, {
    name: result.data.name,
    data: result.data,
  });
  throw error;
}

async function mockExecute(functionName: string, data = {}, res = {}): Promise<any> {
  return res;
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string,
): Promise<IMfaRequiredResult | { idToken: string }> {
  const result = await mockExecute(
    'user_signInWithEmailAndPassword',
    {
      email,
      password,
    },
    {
      idToken: 'mock id token',
    },
  );
  return result;
}