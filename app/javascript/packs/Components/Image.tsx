import React, { useState } from 'react';

const Image = ({ src, altSrc, className, alt }: { src: string; altSrc: string; className?: string; alt?: string }) => {
  const [errored, setErrored] = useState(!src);
  const onError = () => setErrored(true);
  if (errored) return <img src={altSrc} alt={alt || ''} className={className || ''} />;
  return <img src={src} alt={alt || ''} className={className || ''} onError={onError} />;
};

export default Image;
