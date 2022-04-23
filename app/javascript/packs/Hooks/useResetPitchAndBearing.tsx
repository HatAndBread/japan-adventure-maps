import { Map } from 'mapbox-gl';
import react, { useEffect } from 'react';

export const useResetPitchAndBearing = () => {
  const map = window.mapboxMap as Map;
  useEffect(() => {
    map.once('idle', () => {
      map.setBearing(0);
      map.setPitch(0);
    });
  }, []);
};
