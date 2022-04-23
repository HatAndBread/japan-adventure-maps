import React from 'react';
import { Mountain } from '../../Types/Models';
import Image from '../Image';

const MountainModal = ({ mountain }: { mountain: Mountain }) => {
  return (
    <div className='mountain-modal'>
      <h1>{mountain.name}</h1>
      <h2>Elevation: {mountain.elevation} meters</h2>
      {mountain.prominence && <h2>Prominence: {mountain.prominence || '?'} meters</h2>}
      {mountain.imageURL && <Image src={mountain.imageURL} altSrc='' alt='thumbnail'></Image>}
      {mountain.wikiurls &&
        mountain.wikiurls.map((url, i) => (
          <div key={i}>
            {url && (
              <a href={url} target='_blank'>
                {i ? 'English Wikipedia' : 'Japanese Wikipedia'}
              </a>
            )}
          </div>
        ))}
    </div>
  );
};
export default MountainModal;
