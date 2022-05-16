import React, { useRef, useState, useEffect } from 'react';
import { LngLat } from 'mapbox-gl';
import Quill from 'quill';
import ImageResize from '@taoqf/quill-image-resize-module';
import { Popups } from '../../Types/Models';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { CirclePicker } from 'react-color';
import QuillEditor from '../../Components/Quill/QuillEditor';

Quill.register('modules/imageResize', ImageResize);

const MapPopUpEditor = ({
  popupPos,
  setPopupPos,
  popups,
  setPopups,
}: {
  popupPos: LngLat;
  setPopupPos: React.Dispatch<React.SetStateAction<LngLat>>;
  popups: Popups;
  setPopups: React.Dispatch<React.SetStateAction<Popups>>;
}) => {
  const sameLngLat = (p: { lngLat: { lng: number; lat: number } }) =>
    p.lngLat.lng === popupPos.lng && p.lngLat.lat === popupPos.lat;
  const alreadyCreatedPopup = popups?.find((p) => sameLngLat(p));
  const startStateDelta = alreadyCreatedPopup?.delta;
  const [markerColor, setMarkerColor] = useState(alreadyCreatedPopup ? alreadyCreatedPopup.markerColor : 'rgb(0,0,0)');
  const [delta, setDelta] = useState(startStateDelta ? startStateDelta : '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const addToPopups = () => {
    const popup = {
      markerColor,
      lngLat: popupPos,
      delta
    };
    const newPopups = [...popups];
    if (alreadyCreatedPopup) {
      const popupIndex = newPopups.findIndex((p) => sameLngLat(p));
      newPopups[popupIndex] = popup;
    } else {
      newPopups.push(popup);
    }
    setPopups(newPopups);
    setPopupPos(null);
  };

  return (
    <div className='MapPopUpEditor'>
      <button
        style={{ backgroundColor: markerColor, color: 'white' }}
        onClick={() => setShowColorPicker(!showColorPicker)}>
        Marker Color
      </button>
      <div
        className='color-picker'
        style={{ height: showColorPicker ? '100%' : '0', overflow: showColorPicker ? 'visible' : 'hidden' }}>
        <CirclePicker
          onChangeComplete={(c) => {
            setMarkerColor(c.hex);
            setShowColorPicker(false);
          }}
        />
      </div>
      <QuillEditor setDelta={setDelta} startStateDelta={startStateDelta} focusOnStart={true} />
      <button className='save-button' onClick={addToPopups}>
        {alreadyCreatedPopup ? 'Save POI' : 'Add POI'}
      </button>
    </div>
  );
};

export default MapPopUpEditor;
