import React, { useEffect } from 'react';
import { Route, routeDistance, drawRoute, elevationChangeCalculation, moveStartMarker } from '../../lib/map-logic';
import { LngLat } from 'mapbox-gl';
import { last, isEqual } from 'lodash';

export const useRouteUpdate = (
  route: Route,
  setDistance: React.Dispatch<React.SetStateAction<number>>,
  setElevationChange: React.Dispatch<React.SetStateAction<number>>,
  routeHistory: Route[]
) => {
  useEffect(() => {
    if (route?.length) {
      setDistance(routeDistance(route));

      drawRoute(route);
      setElevationChange(elevationChangeCalculation(route));
      if (route.length > 1 && !isEqual(last(routeHistory), route)) {
        routeHistory.push(route);
      }
      moveStartMarker(new LngLat(route[0].lng, route[0].lat));
    }
    if (route && !route.length) {
      drawRoute(route);
    }
  }, [route]);
  useEffect(() => {}, [route]);
};
