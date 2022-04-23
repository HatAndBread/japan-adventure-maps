import React, { useState, useEffect } from 'react';

const StreetView = ({ streetViewURL }: { streetViewURL: string }) => {
  const [url, setURL] = useState(streetViewURL);
  useEffect(() => {
    if (streetViewURL !== url) {
      setURL(streetViewURL);
    }
  }, [streetViewURL, url]);

  return <iframe id='street-view' title='Street View' width='500' height='500' src={url}></iframe>;
};

export default StreetView;
