import React from 'react';
import fallback from '../../../assets/images/fallback.png';

const Avatar = ({ avatarPath, width, height }: { avatarPath?: string; width?: number; height?: number }) => {
  const getWidth = () => (width ? `${width}px` : `32px`);
  const getHeight = () => (height ? `${height}px` : `32px`);
  if (avatarPath)
    return <img src={avatarPath} alt='Avatar' className='avatar' width={getWidth()} height={getHeight()} />;

  return <img src={fallback} alt='Avatar' className='avatar' width={getWidth()} height={getHeight()} />;
};
export default Avatar;
