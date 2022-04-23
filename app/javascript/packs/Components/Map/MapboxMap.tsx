import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMouseEvent } from 'mapbox-gl';
import { MapEventListenerAdder } from '../../../lib/map-logic';
import { useAppContext } from '../../Context';
import { useResetPitchAndBearing } from '../../Hooks/useResetPitchAndBearing';

let lastFunc: any;

const MapboxMap = ({ onClick, tool }: { onClick?: (e: MapMouseEvent) => any; tool?: string }) => {
  const { controllerAction } = useAppContext().controllerData;
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
  const [mapInitialized, setMapInitialized] = useState(false);
  const ref = useRef<HTMLDivElement>();
  useResetPitchAndBearing();
  useEffect(() => {
    if (ref.current) {
      const container = window.mapboxContainer;
      const map = window.mapboxMap;
      if (!mapInitialized) {
        if (lastFunc) mapEventListenerAdder.off({ type: 'click', listener: lastFunc });
        lastFunc = onClick;
        setMapInitialized(true);
        ref.current.appendChild(container);
        map.resize();
        onClick && mapEventListenerAdder.on({ type: 'click', listener: lastFunc });
      }
      return () => {
        if (mapInitialized) {
          setMapInitialized(false);
          // onClick && map.off('click', onClick);
          //document.body.removeChild(container);
        }
      };
    }
  }, [onClick, mapInitialized, tool, ref]);
  return <div className='map-wrapper' ref={ref}></div>;
};

export const resetLastMapFunction = () => {
  lastFunc = false;
};
export default MapboxMap;
