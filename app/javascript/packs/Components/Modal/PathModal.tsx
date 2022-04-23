import React from 'react';
import { PathModalData } from '../../Types/Models';
import Image from '../Image';

const PathModal = ({ path }: { path: PathModalData }) => {
  console.log(path);
  return (
    <div className='path-modal'>
      <h1>{path.name ? path['name:en'] && `(${path['name:en']})` : `Unnamed ${path.highway || 'path'}`}</h1>
    </div>
  );
};

export default PathModal;
