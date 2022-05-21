import { MapLayerMouseEvent, Map, LngLat } from 'mapbox-gl';
import { last, first, map } from 'lodash';
import { getDirections, getDirectionsInLine, getElevation } from './map-logic';
import { Route } from './map-logic';
import React from 'react';
import axios from 'axios';

const directions = async (
  e: MapLayerMouseEvent,
  type: string,
  route: Route,
  setRoute: (newRoute: Route) => void,
  directionsType: string,
  draggingControlPoint: React.MutableRefObject<boolean>
) => {
  e.originalEvent.stopPropagation();
  e.preventDefault();
  if (window.mapboxMap.getLayer('preview') && window.mapboxMap.getSource('preview')) {
    window.mapboxMap.removeLayer('preview');
    window.mapboxMap.removeSource('preview');
    return; // If preview is present a control point is being dragge
  }
  if (draggingControlPoint.current) {
    draggingControlPoint.current = false;
    return;
  }
  const map = window.mapboxMap as Map;
  if (map.getZoom() < 8.5) return alert('You must zoom in closer to being building your route');
  const lngLat = e.lngLat;
  if (route?.length) {
    const points = [...route];
    const lastPoint = route[route.length - 1];
    const startEnd = [
      { lng: lastPoint.lng, lat: lastPoint.lat },
      { lng: e.lngLat.lng, lat: e.lngLat.lat },
    ];
    const directions =
      type === 'point' ? await getDirections(startEnd, directionsType) : await getDirectionsInLine(startEnd);
    map.flyTo({ essential: true, center: lngLat });
    const newRoute = points.concat(directions);
    last(newRoute).cp = true;
    first(newRoute).cp = true;
    setRoute(newRoute);
  } else {
    const ele = map.queryTerrainElevation([lngLat.lng, lngLat.lat], { exaggerated: false });
    if (!ele && ele !== 0) {
      return alert('Map not loaded yet');
    }
    map.flyTo({ essential: true, center: lngLat });
    setRoute([{ lng: lngLat.lng, lat: lngLat.lat, e: ele, cp: true }]);
  }
};

const goToGoogleMaps = (e: MapLayerMouseEvent) => {
  // @ TODO Figure out which direction should be facing and add to cbp if click on control point
  e.originalEvent.stopPropagation();
  const url = `http://google.com/maps?q=&layer=c&cbll=${e.lngLat.lat},${e.lngLat.lng}&cbp=12,0,0,0,0`;
  if (window.isProbablyDesktop) {
    const win = window.open(
      url,
      'Google Map View',
      `height=${(window.screen.height / 2).toFixed(0)},width=${(window.screen.width / 2).toFixed(0)}`
    );
    if (!win || win.closed || typeof win.closed === 'undefined') {
      alert('Please enable pop ups for this site to use Google Street View.');
    }
  } else {
    window.open(url, '_blank');
  }
};
const searchFlickr = async (
  e: MapLayerMouseEvent,
  setFlickrPhotos: React.Dispatch<React.SetStateAction<string[]>>,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>
) => {
  e.originalEvent.stopPropagation();
  const { lng, lat } = e.lngLat;
  const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${process.env.FLICKR_KEY}&lat=${lat}&lon=${lng}&format=json&nojsoncallback=1&geo_context=2&radius=0.5&content_type=1&accuracy=16&sort=relevance`;
  setLoaderText('Searching for photographs in this area...');
  const data = await axios.get(url);
  const photoUrls = data?.data?.photos?.photo?.map(
    (photo) => `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
  );
  setLoaderText('');
  setFlickrPhotos(photoUrls);
};

const getInfo = async (
  e: MapLayerMouseEvent,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>,
  setWikiData: React.Dispatch<React.SetStateAction<[string, string][]>>
) => {
  e.originalEvent.stopPropagation();
  setLoaderText('Searching for information about this area...');
  try {
    let url = 'https://en.wikipedia.org/w/api.php?origin=*';

    const params = {
      action: 'query',
      list: 'geosearch',
      gscoord: `${e.lngLat.lat}|${e.lngLat.lng}`,
      gsradius: '10000',
      gslimit: '10',
      format: 'json',
    };

    Object.keys(params).forEach(function (key) {
      url += '&' + key + '=' + params[key];
    });

    const response = await axios.get(url);
    const data = response.data?.query?.geosearch;
    if (data?.length) {
      const result = data.map((d) => [d.title, `https://en.wikipedia.org/?curid=${d.pageid}`]);
      setWikiData(result);
      setLoaderText('');
    }
  } catch {}
  setLoaderText('');
};

const getWeather = async (
  e: MapLayerMouseEvent,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>,
  setWeather: React.Dispatch<
    React.SetStateAction<
      {
        high: number;
        low: number;
        humidity: number;
        rain: number;
        weather: string;
        iconUrl: string;
      }[]
    >
  >
) => {
  e.originalEvent.stopPropagation();
  setLoaderText('Getting weather forecast for this area...');
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=${process.env.WEATHER_KEY}`;
  const res = await axios.get(url);
  const data = res?.data?.daily as any[];
  if (data) {
    const weather = data.map((day) => {
      return {
        high: day.temp.max,
        low: day.temp.min,
        humidity: day.humidity,
        rain: day.rain,
        weather: day.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
      };
    });
    setWeather(weather);
  }
  setLoaderText('');
  console.log(res);
};

export const getClickFunc = (
  tool: string,
  route: Route,
  setRoute: (newRoute: Route) => void,
  directionsType: string,
  setFlickrPhotos: React.Dispatch<React.SetStateAction<string[]>>,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>,
  draggingControlPoint: React.MutableRefObject<boolean>,
  setWikiData: React.Dispatch<React.SetStateAction<[string, string][]>>,
  setWeather: React.Dispatch<
    React.SetStateAction<
      {
        high: number;
        low: number;
        humidity: number;
        rain: number;
        weather: string;
        iconUrl: string;
      }[]
    >
  >
) => {
  switch (tool) {
    case 'point': {
      return (e: MapLayerMouseEvent) => directions(e, 'point', route, setRoute, directionsType, draggingControlPoint);
    }
    case 'line': {
      return (e: MapLayerMouseEvent) => directions(e, 'line', route, setRoute, directionsType, draggingControlPoint);
    }
    case 'google': {
      return (e) => goToGoogleMaps(e);
    }
    case 'flickr': {
      return (e) => searchFlickr(e, setFlickrPhotos, setLoaderText);
    }
    case 'info': {
      return (e) => getInfo(e, setLoaderText, setWikiData);
    }
    case 'weather': {
      return (e) => getWeather(e, setLoaderText, setWeather);
    }
    default:
      return () => {};
  }
};
