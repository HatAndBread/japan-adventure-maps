import React from 'react';
import Loader from 'react-loader-spinner';

const MyLoader = () => {
  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Loader type='ThreeDots' color='#00BFFF' height={100} width={100} timeout={10000} />
    </div>
  );
};

export default MyLoader;
