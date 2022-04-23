import React, { useState, useRef, useEffect } from 'react';
import { addMarker, createMarker, RouteInserter } from '../../lib/map-logic';
import { Marker, LngLat, Map } from 'mapbox-gl';
import { debounce } from 'lodash';
import { useRideContext } from '../Rides/Ride';

export const UseControlPoints = () => {
  const map = window.mapboxMap as Map;
  const { route, routeRef, setRoute, directionsTypeRef, toolRef, tool, hoveringOverMarkerRef, draggingControlPoint } =
    useRideContext();
  const [controlPointMarkers, _setControlPointMarkers] = useState<Marker[]>([]);
  const controlPointMarkersRef = useRef(controlPointMarkers);
  const setControlPointMarkers = (data: Marker[]) => {
    controlPointMarkersRef.current = data;
    _setControlPointMarkers(data);
  };

  const onDragEnd = async (e: any) => {
    if (!['point', 'line', 'cp'].includes(toolRef.current)) return;
    const element = e.target._element as HTMLElement;
    const elementIndex = parseInt(element.dataset.id);
    const routeInserter = new RouteInserter(routeRef, e.target._lngLat as LngLat, elementIndex, directionsTypeRef);
    const isPoint = toolRef.current === 'point' || toolRef.current === 'cp';
    if (elementIndex === 0) {
      const newRoute = isPoint
        ? await routeInserter.insertStartOfRoute()
        : await routeInserter.insertStartOfRoute(true);
      return setRoute(newRoute);
    }
    if (elementIndex === routeRef.current.length - 1) {
      const newRoute = isPoint ? await routeInserter.insertEndOfRoute() : await routeInserter.insertEndOfRoute(true);
      return setRoute(newRoute);
    }
    const newRoute = isPoint ? await routeInserter.insertMidRoute() : await routeInserter.insertMidRoute(true);
    setTimeout(() => {
      draggingControlPoint.current = false;
    }, 500);
    return setRoute(newRoute);
  };

  const onDrag = (e: any) => {
    if (routeRef.current.length <= 1) return;
    const element = e.target._element as HTMLElement;
    const elementIndex = parseInt(element.dataset.id);
    const inserter = new RouteInserter(routeRef, e.target._lngLat as LngLat, elementIndex, directionsTypeRef);
    const position = () => {
      if (elementIndex === 0) return 'start';
      if (elementIndex === routeRef.current.length - 1) return 'end';
    };
    toolRef.current === 'line' ? inserter.linePreview(position()) : inserter.roadPreview(position());
  };
  const debouncedDrag = debounce((e: any) => {
    onDrag(e);
  }, 100);

  const baseDrag = (e: any) => {
    draggingControlPoint.current = true;
    if (toolRef.current === 'line') {
      onDrag(e);
    }
    if (toolRef.current === 'cp' || toolRef.current === 'point') {
      debouncedDrag(e);
    }
  };

  const onClick = (e: any) => {
    // delete control point when clicked and tool is control point
    if (toolRef?.current === 'cp') {
      const index = parseInt(e.target.dataset.id);
      if (index && index !== routeRef.current.length - 1) {
        const newRoute = [...routeRef.current];
        newRoute[index].cp = undefined;
        setRoute(newRoute);
      }
    }
  };

  const setControlPointDrag = (marker: Marker, shouldBeDraggable: boolean) => {
    if (shouldBeDraggable) {
      marker.setDraggable(true);
      marker.on('dragend', onDragEnd);
      marker.on('drag', (e) => baseDrag(e));
    } else {
      marker.setDraggable(false);
    }
  };

  useEffect(() => {
    const shouldBeDraggable = ['cp', 'line', 'point'].includes(tool);
    window.markers.forEach((marker) => {
      if (marker.getElement()?.dataset.type === 'control-point') {
        setControlPointDrag(marker, shouldBeDraggable);
      }
    });
  }, [tool]);

  useEffect(() => {
    if (route?.length) {
      const newMarkers = [];
      const shouldBeDraggable = ['cp', 'line', 'point'].includes(toolRef.current);
      routeRef.current.forEach((p, i) => {
        if (p.cp) {
          const marker = createMarker('control-point');
          marker.getElement().addEventListener('click', onClick);
          marker.getElement().addEventListener('mouseenter', () => (hoveringOverMarkerRef.current = true));
          marker.getElement().addEventListener('mouseleave', () => (hoveringOverMarkerRef.current = false));
          setControlPointDrag(marker, shouldBeDraggable);
          marker.setLngLat(routeRef.current[i]);
          addMarker(marker);
          marker.getElement().dataset.id = i.toString();
          marker.getElement().dataset.type = 'control-point';
          newMarkers.push(marker);
        }
      });
      controlPointMarkersRef.current.forEach((m) => m.remove());
      setControlPointMarkers(newMarkers);
    } else {
      controlPointMarkersRef.current.forEach((m) => m.remove());
      setControlPointMarkers([]);
    }
  }, [route, controlPointMarkersRef]);

  return <></>;
};
