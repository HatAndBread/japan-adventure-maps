import React, { useState } from 'react';

const Image = ({ src, altSrc, className, alt, height }: { src: string; altSrc: string; className?: string; alt?: string, height?: string }) => {
  const [errored, setErrored] = useState(!src);
  const onError = () => setErrored(true);
  if (errored) return <img src={altSrc} alt={alt || ''} className={className || ''} height={height}/>;
  return <img src={src} alt={alt || ''} className={className || ''} onError={onError} height={height}/>;
};

export default Image;
