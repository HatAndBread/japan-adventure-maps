import React, { useEffect } from 'react';

const Loader = ({
  loaderText,
  setLoaderText,
}: {
  loaderText: string | null;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
}) => {
  useEffect(() => {
    setTimeout(() => {
      setLoaderText(null);
    }, 10000);
  }, []);
  return (
    <div className='loader-container'>
      <div className='loader'></div>
      <div className='loader-text'>{loaderText}</div>
    </div>
  );
};

export default Loader;
