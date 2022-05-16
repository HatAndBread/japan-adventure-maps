import React, { useRef, useEffect } from 'react';
import { Map, Marker, Popup as MapboxPopup, LngLat, MapMouseEvent } from 'mapbox-gl';
import { Popups } from '../Types/Models';
import { useRideContext } from '../Rides/Ride';
import { MapEventListenerAdder, addMarker } from '../../lib/map-logic';
import Delta from 'quill-delta';

export const UsePopups = ({setPopupModalData}: {setPopupModalData: React.Dispatch<React.SetStateAction<string>>}) => {
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
  const { popups, setPopups, popupsRef, setPopupPos, toolRef, isEditor } = useRideContext();
  const hoveringOverPopupMarkerRef = useRef(false);
  const onMarkerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const path = e.path || (e.composedPath && e.composedPath());
    const el = path.find((i: HTMLElement) => i?.dataset?.lngLat) as HTMLElement;
    if (!el?.dataset?.lngLat) return;

    const lngLat = JSON.parse(el.dataset.lngLat);
    const popupsCurr = popupsRef.current as Popups;
    const clickedPopup = popupsCurr.find((p) => p.lngLat.lng === lngLat.lng && p.lngLat.lat === lngLat.lat);
    if (!clickedPopup) return;
    setPopupPos(lngLat);
    setPopupModalData(clickedPopup.delta || JSON.stringify(new Delta()));
  }

  useEffect(() => {
    const handlePopup = (e: MapMouseEvent) => {
      if (toolRef.current === 'pop-up' && !hoveringOverPopupMarkerRef.current) {
        e.preventDefault();
        setPopupPos(e.lngLat);
      }
    };
    mapEventListenerAdder.on({ type: 'click', listener: handlePopup });
  }, []);

  useEffect(() => {
    if (!popups?.length) return;

    const newMarkers: Marker[] = [];
    popups.forEach((p) => {
      const marker = new Marker({ color: p.markerColor });
      const el = marker.getElement();
      el.style.cursor = 'pointer';
      el.dataset.lngLat = JSON.stringify(p.lngLat);
      el.addEventListener('click', onMarkerClick);
      el.addEventListener('mouseenter', () => {
        hoveringOverPopupMarkerRef.current = true;
      });
      el.addEventListener('mouseleave', () => {
        hoveringOverPopupMarkerRef.current = false;
      });

      marker.setLngLat(p.lngLat);
      addMarker(marker);
      newMarkers.push(marker);
    });
    return () => {
      // clean up
      newMarkers.forEach((m) => m.remove());
    };
  }, [popups]);
  return <></>;
};
