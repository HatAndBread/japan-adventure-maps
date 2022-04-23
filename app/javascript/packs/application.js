// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Rails from '@rails/ujs';
import Turbolinks from 'turbolinks';
import * as ActiveStorage from '@rails/activestorage';
import 'channels';
import mapboxgl from 'mapbox-gl';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getInstanceVars } from '../lib/getInstanceVars';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/free-brands-svg-icons';
import '@fortawesome/fontawesome-free';
import { MapEventListenerAdder } from '../lib/map-logic';
import axios from '../lib/axios';
import { navbar } from '../lib/navbar';

Rails.start();
Turbolinks.start();
ActiveStorage.start();

const baseURL = window.location.host === 'localhost:3000' ? 'http://localhost:3000' : 'https://pedal-party.bike';
if ('serviceWorker' in navigator && 'caches' in window) {
  navigator.serviceWorker
    .register(
      // path to the service worker file
      `${baseURL}/sw.js`
    )
    // the registration is async and it returns a promise
    .then(function (reg) {
      console.log('Registration Successful');
    });
}

window.isBadBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
window.isProbablyTablet = screen.width < 1000 && screen.width > 500;
window.isProbablyMobile = screen.width <= 500;
window.isProbablyNotDesktop = isProbablyMobile || isProbablyTablet;
window.isProbablyDesktop = !window.isProbablyNotDesktop;
window.disable3d = isBadBrowser && isProbablyNotDesktop;
window.isTouchScreen = false;
window.baseMapName = 'Pedal Party Japan';
window.baseMapURL = `mapbox://styles/pedalparty/cl0drj7vd002a14pjyr3gfwdd?key=${process.env.MAPTILER_KEY}`;

const setTouchScreen = () => {
  window.isTouchScreen = true;
  document.removeEventListener('touchstart', setTouchScreen);
};
document.addEventListener('touchstart', setTouchScreen);

mapboxgl.accessToken = process.env.MAPBOX_KEY;

window.markers = []; // Put ALL Mapbox Markers and Popups in here to be cleared on page change.
window.mapEventListenerAdder ||= new MapEventListenerAdder();
window.mapboxContainer ||= document.createElement('div');
window.mapboxContainer.id = 'map';
window.mapboxMap ||= new mapboxgl.Map({
  container: mapboxContainer,
  style: window.baseMapURL,
  center: [138.2529, 38],
  zoom: 5,
});
window.isProbablyDesktop && window.mapboxMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
window.mapboxMap.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: false,
    showUserHeading: true,
  }),
  'bottom-left'
);

if (window.isBadBrowser) {
  // Try to prevent safari webgl memory leaks
  window.mapboxMap._maxTileCacheSize = 0;
  if (isProbablyNotDesktop) {
    window.mapboxMap.dragRotate.disable();
    window.mapboxMap.touchZoomRotate.disableRotation();
  }
}

export const addLayersAndSources = () => {
  window.mapboxMap.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  });
  window.mapboxMap.addLayer({
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 0.0],
      'sky-atmosphere-sun-intensity': 15,
    },
  });

  // window.mapboxMap.addSource('dirt', {
  //   type: 'vector',
  //   url: 'mapbox://pedalparty.dirt',
  // });
  // window.mapboxMap.addLayer({
  //   id: 'dirt',
  //   type: 'line',
  //   source: 'dirt',
  //   'source-layer': 'dirt',
  //   minzoom: 10,
  //   layout: {
  //     'line-cap': 'round',
  //     'line-join': 'round',
  //   },
  //   paint: {
  //     'line-color': 'rgba(180,120,120, 0.9)',
  //     'line-width': 2,
  //     'line-dasharray': [1, 2],
  //   },
  // });
  // window.mapboxMap.setPaintProperty('dirt', 'line-opacity', [
  //   'interpolate',
  //   // Set the exponential rate of change to 0.5
  //   ['exponential', 0.5],
  //   ['zoom'],
  //   10,
  //   0,
  //   14,
  //   1,
  //   18,
  //   0,
  // ]);
  // window.mapboxMap.setPaintProperty('dirt', 'line-width', [
  //   'interpolate',
  //   // Set the exponential rate of change to 0.5
  //   ['exponential', 0.5],
  //   ['zoom'],
  //   10,
  //   1,
  //   12,
  //   1,
  //   14,
  //   3,
  //   18,
  //   1,
  // ]);
  // add the DEM source as a terrain layer with exaggerated height
  window.mapboxMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
};

window.mapboxMap.on('load', addLayersAndSources);
const startReact = () => {
  navbar();
  // Let's clear any popups or markers on each page load;;
  window.mapEventListenerAdder.removeAll();
  const removeItems = (items) => items?.forEach((item) => item?.remove());
  removeItems(window.markers);
  window.markers = [];
  if (window.mapboxMap.getLayer('route')) window.mapboxMap.removeLayer('route');
  if (window.mapboxMap.getLayer('preview')) window.mapboxMap.removeLayer('preview');
  if (window.mapboxMap.getLayer('trace')) window.mapboxMap.removeLayer('trace');
  if (window.mapboxMap.getSource('route')) window.mapboxMap.removeSource('route');
  if (window.mapboxMap.getSource('preview')) window.mapboxMap.removeSource('preview');
  if (window.mapboxMap.getSource('trace')) window.mapboxMap.removeSource('trace');
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  const instanceVars = getInstanceVars();
  // If instanceVars is not defined useReact is not being used
  if (!instanceVars) return;
  // Render React
  ReactDOM.render(<App controllerData={instanceVars} />, root);
};

document.addEventListener('turbolinks:before-render', () => {
  // Clean up React before each page load!
  window.stop3D = true;
  const root = document.getElementById('root');
  if (root) {
    root.remove();
    Turbolinks.clearCache();
  }
});

document.addEventListener('turbolinks:load', () => {
  startReact();
  let height = 0;
  Array.from(document.getElementsByClassName('rails-flash')).forEach((item) => {
    if (item.innerText.length) {
      height += 40;
      item.style.top = `${height}px`;
      setTimeout(() => {
        item.style.top = '-200px';
      }, 3000);
    }
  });
});

const getUserLocation = async () => {
  const res = await axios.get('/api/user_location');
  window.userLocation = res?.data?.length ? res.data : [138.2529, 36.2048];
};

getUserLocation();
