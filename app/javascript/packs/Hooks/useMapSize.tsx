import { Map } from 'mapbox-gl';
import { useEffect } from 'react';

export const useMapSize = ({ width, height }: { width?: string; height?: string }) => {
  const map = window.mapboxMap as Map;
  useEffect(() => {
    if (width) window.mapboxContainer.style.width = width;
    if (height) window.mapboxContainer.style.height = height;
    if (width || height) map.resize();
  }, []);
};
