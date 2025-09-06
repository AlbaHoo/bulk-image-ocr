import { EStorageProperty } from 'interfaces/IClientApi';
import { lwsClientAPI } from 'platforms';
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Bridge() {
  if (lwsClientAPI) {
    const authToken = lwsClientAPI.getField(EStorageProperty.authToken);

    console.log(`authToken in Bridge ${authToken}`);
    if (authToken) {
      return <Navigate to="/home" replace />;
    }
  }
  return <Navigate to="/login" replace />;
}
