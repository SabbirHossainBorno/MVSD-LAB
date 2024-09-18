// components/DashboardWrapper.js
import React from 'react';
import withAuth from './withAuth';
import LoadingSpinner from './LoadingSpinner';

const DashboardWrapper = (WrappedComponent) => {
  const Wrapper = (props) => (
    <div>
      <LoadingSpinner />
      <WrappedComponent {...props} />
    </div>
  );

  return withAuth(Wrapper);
};

export default DashboardWrapper;
