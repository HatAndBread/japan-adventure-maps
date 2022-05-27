import React, { useEffect } from 'react';
import { useAppContext } from '../Context';
import { useRideContext } from '../Rides/Ride';
import { LngLat, Map } from 'mapbox-gl';
import { addLayersAndSources } from '../../application-esbuild.js';

export const UseMapInitialization = () => {
  const map = window.mapboxMap as Map;
  const { route, setRoute, setPopups, setStartTime, setTitle, setDescription, setLoaderText } = useRideContext();
  const ctx = useAppContext();
  const isEditor = ['rides#new', 'rides#edit'].includes(ctx.controllerData.controllerAction);
  const { ride, controllerAction, profile } = ctx.controllerData;
  useEffect(() => {
    // Initialize state
    const setInitialState = () => {
      setRoute(JSON.parse(ride.route));
      setPopups(JSON.parse(ride.popups));
      if (ride.description) setDescription(ride.description);
      if (ride.title) setTitle(ride.title);
      if (ride.startTime) setStartTime(ride.startTime);
      if (controllerAction === 'rides#new') {
        const routeUnderConstruction = !!(localStorage.getItem('newRoute') || localStorage.getItem('editRoute'));
        if (!routeUnderConstruction && profile?.startLng && profile?.startLat) {
          map.jumpTo({ center: new LngLat(profile.startLng, profile.startLat), zoom: 14 });
        } else if (!routeUnderConstruction && window.userLocation?.length) {
          map.jumpTo({ center: new LngLat(window.userLocation[0], window.userLocation[1]), zoom: 5 });
        }
      }
      if (map.getStyle().name !== window.baseMapName) {
        map.setStyle(window.baseMapURL);
        map.once('style.load', () => {
          addLayersAndSources();
          setRoute(JSON.parse(ride.route));
        });
      }
    };
    if (map.loaded()) {
      setInitialState();
    } else {
      map.once('styledata', setInitialState);
    }
    setLoaderText(null);
  }, []);
  return <></>;
};
