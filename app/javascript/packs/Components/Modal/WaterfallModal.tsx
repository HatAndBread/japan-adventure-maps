
import React from 'react';
import { Waterfall } from '../../Types/Models';
import Image from '../Image';

const WaterfallModal = ({ waterfall }: { waterfall: Waterfall }) => {
  return (
    <div className='mountain-modal'>
      <h1>{waterfall.name}</h1>
      {waterfall.imageURL && <Image src={waterfall.imageURL} altSrc='' alt='thumbnail'></Image>}
      {waterfall.wikiurls &&
        waterfall.wikiurls.map((url, i) => (
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
export default WaterfallModal;
