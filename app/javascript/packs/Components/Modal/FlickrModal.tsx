import React, { useState } from 'react';

const FlickrModal = ({ flickrPhotos }: { flickrPhotos: string[] }) => {
  const [showingNumber, setShowingNumber] = useState(10);
  return (
    <div className='FlickrModal'>
      {flickrPhotos.map((photoSrc, i) => {
        if (i >= showingNumber - 10 && i < showingNumber) return <img src={photoSrc} width='100%' key={photoSrc}></img>;
      })}
      {showingNumber - 10 > 0 && (
        <a
          onClick={() => {
            setShowingNumber(showingNumber - 10);
          }}>
          <i className='fas fa-arrow-left'></i> Previous&nbsp;
        </a>
      )}
      {showingNumber < flickrPhotos.length && (
        <a
          onClick={() => {
            setShowingNumber(showingNumber + 10);
          }}>
          &nbsp;Next <i className='fas fa-arrow-right'></i>
        </a>
      )}
    </div>
  );
};

export default FlickrModal;
