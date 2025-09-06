import { EStorageProperty } from 'interfaces/IClientApi';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Parse from 'parse';
import { lwsClientAPI } from 'platforms'; // Assuming you have a platform-specific API

const withAuth = (Component: React.ComponentType) => {
  return (props: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      const autoLogin = async () => {
        const authToken = lwsClientAPI.getField(EStorageProperty.authToken);
        console.log(`authToken in Bridge ${authToken}`);
        if (authToken) {
          try {
            await Parse.User.become(authToken);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Auto-login failed:', error);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      };

      autoLogin();
    }, []);

    if (isAuthenticated === null) {
      return <div>Loading...</div>; // Or any loading indicator
    }

    if (isAuthenticated) {
      return <Component {...props} />;
    }

    return <Navigate to="/login" />;
  };
};

export default withAuth;
