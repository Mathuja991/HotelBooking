import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isOwner, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return <div className='text-center mt-20 text-xl'>Loading...</div>;
  }

  if (!isOwner) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default ProtectedRoute;
