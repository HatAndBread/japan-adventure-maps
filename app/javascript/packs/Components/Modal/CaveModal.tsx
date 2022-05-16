import React from 'react';
import { Cave } from '../../Types/Models';
import Image from '../Image';

const CaveModal = ({ cave }: { cave: Cave }) => {
  return (
    <div className='mountain-modal'>
      <h1>{cave.name}</h1>
      {cave.imageURL && <Image src={cave.imageURL} altSrc='' alt='thumbnail'></Image>}
      {cave.wikiurls &&
        cave.wikiurls.map((url, i) => (
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
export default CaveModal;
