import React, { useEffect, useRef } from 'react';
import { useRideContext } from '../Rides/Ride';
import { useAppContext } from '../Context';
import { Map, LngLat } from 'mapbox-gl';
import { addMarker, moveStartMarker } from '../../lib/map-logic';

const UseLocalStorage = () => {
  const map = window.mapboxMap as Map;
  const { route, setRoute, routeRef, popups, setPopups } = useRideContext();
  const firstTime = useRef(true);
  const mapIdle = useRef(false);
  const appCtx = useAppContext();
  const page = appCtx.controllerData.controllerAction;
  const editId = appCtx.controllerData?.ride?.id?.toString();

  useEffect(() => {
    const setToPreviousMap = (routeName: string, popupsName: string) => {
      const r = localStorage.getItem(routeName);
      const p = localStorage.getItem(popupsName);
      if (firstTime.current) {
        firstTime.current = false;
        map.once('idle', () => {
          if (editId === localStorage.getItem('editId') && page === 'rides#edit') setRoute(JSON.parse(r));
          if (page === 'rides#new' && r) setRoute(JSON.parse(r));
          if (p) setPopups(JSON.parse(p));
          mapIdle.current = true;
          map.once('idle', () => {
            const length = routeRef.current?.length;
            if (typeof length === 'number') {
              const lastItem = routeRef.current[length - 1];
              if (!lastItem) return;
              map.jumpTo({ center: new LngLat(lastItem.lng, lastItem.lat), zoom: 14 });
              addMarker(moveStartMarker(new LngLat(routeRef.current[0].lng, routeRef.current[0].lat)));
            }
          });
        });
        return;
      }
      if (!firstTime.current && mapIdle.current) {
        if (route) localStorage.setItem(routeName, JSON.stringify(route));
        if (!route) localStorage.removeItem(routeName);
        if (popups) localStorage.setItem(popupsName, JSON.stringify(popups));
        if (routeName === 'editRoute' && editId) localStorage.setItem('editId', editId);
        if (routeName === 'editRoute' && !editId) localStorage.removeItem('editId');
      }
    };
    if (page === 'rides#new') {
      setToPreviousMap('newRoute', 'newPopups');
      return;
    }
    setToPreviousMap('editRoute', 'editPopups');
  }, [route, popups]);
  return <></>;
};

export default UseLocalStorage;
