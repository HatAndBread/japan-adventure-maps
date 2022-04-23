import React from 'react';

const WikiModal = ({ wikiData }: { wikiData: [string, string][] }) => {
  return (
    <div className='wiki-modal'>
      <ul>
        {wikiData.map((d) => (
          <li key={d[1]}>
            <a href={d[1]} target='_blank'>
              {d[0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WikiModal;
