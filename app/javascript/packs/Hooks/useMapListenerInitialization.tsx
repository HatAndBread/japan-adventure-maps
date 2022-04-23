import React, { useEffect, useRef } from 'react';
import {
  nearestPoint,
  getRouteBoundingBox,
  getElevation,
  routeDistance,
  RouteInserter,
  MapEventListenerAdder,
  moveStartMarker,
  createMarker,
  addMarker,
} from '../../lib/map-logic';
import { Map, LngLat } from 'mapbox-gl';
import { debounce, last } from 'lodash';
import { useRideContext } from '../Rides/Ride';
import { useAppContext } from '../Context';

export const UseMapListenerInitialization = () => {
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
  const map = window.mapboxMap as Map;
  const lineListenerCreated = useRef(false);
  const goneToStartLocation = useRef(false);
  const elevationDisplayListenersCreated = useRef(false);
  const ctx = useRideContext();
  const appCtx = useAppContext();
  const {
    route,
    setRoute,
    routeRef,
    toolRef,
    hoveringOverMarkerRef,
    draggingPointIndex,
    setElevationDistanceDisplay,
    directionsTypeRef,
    isEditor,
  } = useRideContext();
  useEffect(() => {
    if (route?.length) {
      const lineLayer = map.getLayer('route');
      if (
        !goneToStartLocation.current &&
        ['rides#edit', 'rides#show'].includes(appCtx.controllerData?.controllerAction)
      ) {
        goneToStartLocation.current = true;
        const bbox = getRouteBoundingBox(route);
        map.fitBounds(bbox, { animate: false, maxZoom: 14, padding: 100 });
      }

      if (appCtx.controllerData.controllerAction === 'rides#show') {
        addMarker(moveStartMarker(new LngLat(route[0].lng, route[0].lat)));
        addMarker(
          createMarker('end-marker')
            .setOffset([17, -18])
            .setLngLat(new LngLat(last(route).lng, last(route).lat))
        );
      }

      if (appCtx.controllerData.controllerAction === 'rides#edit') {
        addMarker(moveStartMarker(new LngLat(route[0].lng, route[0].lat)));
      }

      if (!elevationDisplayListenersCreated.current) {
        elevationDisplayListenersCreated.current = true;
        mapEventListenerAdder.onWithLayer({
          type: 'mousemove',
          layerName: 'route',
          listener: (e) => {
            const np = nearestPoint(e.lngLat, routeRef.current);
            const point = routeRef.current[np];
            setElevationDistanceDisplay({
              elevation: point.e,
              distance: routeDistance([...routeRef.current].slice(0, np)),
              x: e.originalEvent.x,
              y: e.originalEvent.y,
            });
          },
        });

        mapEventListenerAdder.onWithLayer({
          type: 'mouseleave',
          layerName: 'route',
          listener: () => setElevationDistanceDisplay(null),
        });
      }

      if (lineLayer && !lineListenerCreated.current) {
        lineListenerCreated.current = true;

        const shortestRoute = async (lngLat: LngLat) => {
          const np = nearestPoint(lngLat, routeRef.current);
          const [try1, try2] = [[...routeRef.current], [...routeRef.current]];
          const e = getElevation(lngLat);
          const geoData = { lng: lngLat.lng, lat: lngLat.lat, e, cp: true };
          try1.splice(np, 0, geoData);
          try2.splice(np + 1, 0, geoData);
          const d1 = routeDistance(try1);
          const d2 = routeDistance(try2);
          if (d1 < d2) return try1;
          return try2;
        };

        mapEventListenerAdder.onWithLayer({
          type: 'click',
          layerName: 'route',
          listener: async (e) => {
            if (!isEditor) return;
            if (toolRef.current === 'cp') {
              if (!hoveringOverMarkerRef.current) {
                const r = await shortestRoute(e.lngLat);
                setRoute(r);
              }
            }
            hoveringOverMarkerRef.current = false;
          },
        });

        mapEventListenerAdder.onWithLayer({
          type: 'mousedown',
          layerName: 'route',
          listener: (e) => {
            if (!isEditor) return;
            if (!hoveringOverMarkerRef.current) {
              e.preventDefault();
              let np = nearestPoint(e.lngLat, routeRef.current);
              if (np === routeRef.current.length - 1) np = np - 1;
              draggingPointIndex.current = np;
            }
          },
        });

        mapEventListenerAdder.on({
          type: 'mousemove',
          listener: debounce(async (e) => {
            if (!isEditor) return;
            if (draggingPointIndex.current && toolRef.current === 'point') {
              new RouteInserter(routeRef, e.lngLat, draggingPointIndex.current, directionsTypeRef).roadPreview();
            }
          }, 200),
        });

        mapEventListenerAdder.on({
          type: 'mousemove',
          listener: (e) => {
            if (draggingPointIndex.current && toolRef.current === 'line') {
              if (!isEditor) return;
              new RouteInserter(routeRef, e.lngLat, draggingPointIndex.current, directionsTypeRef).linePreview();
            }
          },
        });

        mapEventListenerAdder.on({
          type: 'mouseup',
          listener: async (e) => {
            if (!isEditor) return;
            if (draggingPointIndex.current && (toolRef.current === 'point' || toolRef.current === 'line')) {
              e.preventDefault();
              const inserter = new RouteInserter(routeRef, e.lngLat, draggingPointIndex.current, directionsTypeRef);
              const newRoute =
                toolRef.current === 'point' ? await inserter.insertMidRoute() : await inserter.insertMidRoute(true);
              setRoute(newRoute);
            }
            if (map.getLayer('preview')) map.removeLayer('preview');
            if (map.getSource('preview')) map.removeSource('preview');
            draggingPointIndex.current = null;
          },
        });
      }
    }
  }, [route]);
  return <></>;
};
