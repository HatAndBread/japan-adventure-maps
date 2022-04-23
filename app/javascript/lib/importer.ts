import { Route } from './map-logic';
import toGeoJSON from '@mapbox/togeojson';

export const importer = (fileType: 'gpx' | 'kml', fileText: string): Route | false => {
  try {
    const geoJSON = toGeoJSON[fileType](new DOMParser().parseFromString(fileText, 'text/xml'));
    return geoJSON.features[0].geometry.coordinates.map((coord: [number, number, number]) => ({
      lng: coord[0],
      lat: coord[1],
      e: coord[2],
    }));
  } catch {
    return false;
  }
};
