import React, { useEffect } from 'react';
import { Map } from 'mapbox-gl';
import { useAppContext } from '../Context';

export const useResetPitchAndBearing = () => {
  const map = window.mapboxMap as Map;
  const { controllerAction } = useAppContext().controllerData;
  useEffect(() => {
    map.once('idle', () => {
      map.setBearing(0);
      map.setPitch(controllerAction === 'pages#three_d_demo' ? 80 : 0);
    });
  }, []);
};
