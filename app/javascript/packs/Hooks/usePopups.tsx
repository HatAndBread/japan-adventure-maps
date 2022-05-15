import React, { useRef, useEffect } from 'react';
import { Map, Marker, Popup as MapboxPopup, LngLat, MapMouseEvent } from 'mapbox-gl';
import { Popups } from '../Types/Models';
import { useRideContext } from '../Rides/Ride';
import { MapEventListenerAdder, addMarker } from '../../lib/map-logic';

export const UsePopups = () => {
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
  const { popups, setPopups, popupsRef, setPopupPos, toolRef, isEditor } = useRideContext();
  const hoveringOverPopupMarkerRef = useRef(false);
  const onMarkerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e.stopPropagation);
    const path = e.path || (e.composedPath && e.composedPath());
    const el = path.find((i: HTMLElement) => i?.dataset?.lngLat) as HTMLElement;
    if (!el?.dataset?.lngLat) return;

    const lngLat = JSON.parse(el.dataset.lngLat);
    const popupsCurr = popupsRef.current as Popups;
    const clickedPopup = popupsCurr.find((p) => p.lngLat.lng === lngLat.lng && p.lngLat.lat === lngLat.lat);
    if (!clickedPopup) return;
    const popup = new MapboxPopup({ closeOnClick: false })
      .setLngLat(clickedPopup.lngLat)
      .setHTML(clickedPopup.htmlContent);
    addMarker(popup);
    const popupEl = popup.getElement();
    const popupContent = Array.from(popupEl.children).find((c) => c.classList.contains('mapboxgl-popup-content'));
    if (!popupContent || !isEditor) return;
    const createButtons = (className: string) => {
      const button = document.createElement('a');
      button.style.marginRight = '8px';
      const i = document.createElement('i');
      i.className = className;
      button.appendChild(i);
      button.style.cursor = 'pointer';
      popupContent.insertAdjacentElement('beforeend', button);
      return button;
    };
    const editButton = createButtons('fas fa-edit');
    const trashButton = createButtons('fas fa-trash');
    const handleEditClick = (e: MouseEvent) => {
      popup.remove();
      setPopupPos(lngLat);
      editButton.removeEventListener('click', handleEditClick);
      e.preventDefault();
      e.stopPropagation();
    };
    const handleTrashClick = (e: MouseEvent) => {
      const confirmation = confirm('Are you sure you want to delete this point of interest?');
      if (confirmation) {
        const newPopups = popupsCurr.filter((p) => p.lngLat.lng !== lngLat.lng && p.lngLat.lat !== lngLat.lat);
        setPopups(newPopups);
      }
      trashButton.removeEventListener('click', handleTrashClick);
      popup.remove();
      e.preventDefault();
      e.stopPropagation();
    };
    editButton.addEventListener('click', handleEditClick);
    trashButton.addEventListener('click', handleTrashClick);
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

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
