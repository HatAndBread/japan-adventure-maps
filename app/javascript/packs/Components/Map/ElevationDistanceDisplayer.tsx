import React from 'react';
import { Map } from 'mapbox-gl';

const ElevationDistanceDisplayer = ({
  data,
}: {
  data: { elevation: number; distance: number; x: number; y: number };
}) => {
  return (
    <div className='ElevationDistanceDisplayer' style={{ left: `${data.x + 10}px`, top: `${data.y}px` }}>
      <div>Elevation: {Math.round(data.elevation)}m</div>
      <div>Distance: {data.distance.toFixed(1)}km</div>
    </div>
  );
};

export default ElevationDistanceDisplayer;
