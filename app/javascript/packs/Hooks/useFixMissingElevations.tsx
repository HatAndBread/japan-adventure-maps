import React, { useEffect } from 'react';
import { Route } from '../../lib/map-logic';
import { LngLat, Map } from 'mapbox-gl';
import { getElevation } from '../../lib/map-logic';
import { last } from 'lodash';
import { useRideContext } from '../Rides/Ride';

export const UseFixMissingElevations = () => {
  // if there is missing elevation data load the tiles and fill in missing elevations
  const { route, setRoute } = useRideContext();
  useEffect(() => {
    if (!route?.length) return;

    const noElevationDataPointIndex = route.findIndex((p) => !p.e && p.e !== 0);
    if (noElevationDataPointIndex !== -1) {
      const previousValidElevation = () =>
        [...route]
          .splice(0, noElevationDataPointIndex)
          .reverse()
          .find((p) => p.e || p.e === 0)?.e;
      const nextValidElevation = () =>
        [...route].splice(noElevationDataPointIndex, route.length).find((p) => p.e || p.e === 0)?.e;
      const map = window.mapboxMap as Map;
      const point = route[noElevationDataPointIndex];
      const lngLat = new LngLat(point.lng, point.lat);
      map.jumpTo({ center: lngLat });
      map.once('idle', () => {
        const newRoute = route.map((p) => {
          if (p.e || p.e === 0) return p;
          let e = getElevation(new LngLat(p.lng, p.lat));
          if (!e && e !== 0) e = previousValidElevation() || nextValidElevation() || 0;
          p.e = e;
          return p;
        });
        setRoute(newRoute);
        map.jumpTo({ center: new LngLat(last(newRoute).lng, last(newRoute).lat) });
      });
    }
  }, [route]);
  return <></>;
};
