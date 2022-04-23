import React, { useEffect } from 'react';

const FacebookShareButton = ({ style }: { style?: {} }) => {
  useEffect(() => {
    try {
      window.FB?.XFBML.parse();
    } catch {
      console.log('Facebook share error');
    }
  }, []);
  return (
    <div
      className='fb-share-button'
      data-href={window.location.href}
      data-layout='button'
      data-size='large'
      style={style}></div>
  );
};

export default FacebookShareButton;
