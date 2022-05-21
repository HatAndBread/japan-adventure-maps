import { LngLat, LngLatBounds, Map, Marker, Popup, MapLayerEventType, AnySourceImpl, GeoJSONSource } from 'mapbox-gl';
import { DirectionsResponse } from '../packs/Types/RideWithResponse';
import along from '@turf/along';
import { lineString } from '@turf/helpers';
import length from '@turf/length';
import distance from '@turf/distance';
export type DirectionsType = 'cycling' | 'walking' | 'driving';
import { first, last } from 'lodash';

export const createMarker = (className: string) => {
  const el = document.createElement('div');
  el.className = className;
  return new Marker(el);
};

export const addMarker = (marker: Marker | Popup) => {
  marker.addTo(getMap());
  window.markers.push(marker);
};

const startMarker = createMarker('start-marker');
startMarker.setOffset([0, -20]);
export type Point = { lng: number; lat: number; e: number; cp?: boolean };
export type Route = Point[];
export type RouteRef = React.MutableRefObject<
  {
    lng: number;
    lat: number;
    e: number;
    cp?: boolean;
  }[]
>;

export type SetRoute = (
  newRoute: {
    lng: number;
    lat: number;
    e: number;
    cp?: boolean;
  }[]
) => void;

export type GeoJSON = {
  type: string;
  features: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }[];
};

const getMap = () => window.mapboxMap as Map;
export const moveStartMarker = (lngLat: LngLat) => startMarker.setLngLat(lngLat);

export const getDirections = async (
  wayPoints: { lng: number; lat: number }[],
  directionsType: string
): Promise<{ lng: number; lat: number; e: number; cp?: boolean }[]> => {
  const wayPointsList = wayPoints.map((p, i) => `${p.lng},${p.lat}${i === wayPoints.length - 1 ? '' : ';'}`).join('');
  const url = `https://api.mapbox.com/directions/v5/mapbox/${directionsType}/${wayPointsList}?geometries=geojson&steps=true&language=en&overview=full&access_token=${process.env.MAPBOX_KEY}`;
  const res = await fetch(url);
  if (res.status !== 200) return; // Handle me correctly please!

  const data = (await res.json()) as DirectionsResponse;
  const coords = [];
  for (const c of data.routes[0].geometry.coordinates) {
    const lngLat = new LngLat(c[0], c[1]);
    const e = getElevation(lngLat);
    coords.push({ lng: lngLat.lng, lat: lngLat.lat, e });
  }
  return coords;
};

export const getDirectionsInLine = async (
  points: { lng: number; lat: number }[]
): Promise<{ lng: number; lat: number; e: number; cp?: boolean }[]> => {
  const distance = distanceBetween(points[0].lng, points[0].lat, points[1].lng, points[1].lat);
  const line = lineString([
    [points[0].lng, points[0].lat],
    [points[1].lng, points[1].lat],
  ]);
  const midPoints = [];
  if (distance > 0.01) {
    for (let i = 0.01; i < distance; i += 0.01) {
      const c = along(line, i).geometry.coordinates;
      const lngLat = new LngLat(c[0], c[1]);
      const e = getElevation(lngLat);
      midPoints.push({ lng: lngLat.lng, lat: lngLat.lat, e });
    }
  }
  const e = getElevation(new LngLat(points[1].lng, points[1].lat));
  midPoints.push({
    lng: points[1].lng,
    lat: points[1].lat,
    e,
  });
  return midPoints;
};

const getLineColor = (layerName: string) => {
  if (layerName === 'route') return 'rgba(250,50,50,0.7)';
  if (layerName === 'preview') return 'rgba(250, 50, 50, 0.3)';
  return 'rgb(165,42,42)';
};

const getGeoJSON = (geometry: Route): GeoJSON => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: geometry.map((i) => [i.lng, i.lat]),
        },
      },
    ],
  };
};

export const createLayerAndSource = (layerName: string) => {
  const map = getMap();
  if (!map.getLayer(layerName)) {
    map.addSource(layerName, {
      type: 'geojson',
      data: [] as any,
    });
    map.addLayer({
      id: layerName,
      type: 'line',
      source: layerName,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': getLineColor(layerName),
        'line-width': layerName === 'route' || layerName === 'preview' ? 5 : 2,
      },
    });
  }
};

export const draw = (layerName: string, geojson: GeoJSON) => {
  const map = getMap();
  createLayerAndSource(layerName);
  const source = map.getSource(layerName) as any;
  source.setData(geojson);
};

export const drawRoute = (route: Route) => {
  draw('route', getGeoJSON(route));
  if (route.length === 1) {
    addMarker(startMarker.setLngLat([route[0].lng, route[0].lat]));
  }
  if (!route.length) startMarker.remove();
};

export const routeDistance = (route: Route) => {
  if (!route) return 0;
  let distance = 0;
  for (let i = 0; i < route.length; i++) {
    if (route[i + 1]) {
      distance += distanceBetween(route[i].lng, route[i].lat, route[i + 1].lng, route[i + 1].lat);
    }
  }
  return distance;
};

export const distanceBetween = (lng1: number, lat1: number, lng2: number, lat2: number) => {
  return distance([lng1, lat1], [lng2, lat2]);
};

export const maxElevation = (route: Route) => route.reduce((acc, curr) => (acc.e > curr.e ? acc : curr)).e;
export const elevationGain = (route: Route) => {
  let total = 0;
  for (let i = 0; i < route.length; i++) {
    if (route[i + 1]?.e > route[i].e) total += route[i + 1].e - route[i].e;
  }
  return total;
};

export const elevationChangeCalculation = (route: Route) => {
  return last(route).e - first(route).e;
};

export const nearestPoint = (
  lngLat: LngLat,
  arr: {
    lng: number;
    lat: number;
    e: number;
    cp?: boolean;
  }[]
) => {
  if (!arr.length) return 0;
  let nearest = Infinity;
  let index: number;
  arr.forEach((p, i) => {
    const x = p.lng - lngLat.lng;
    const y = p.lat - lngLat.lat;
    const d = Math.sqrt(x * x + y * y);
    if (d < nearest) {
      nearest = d;
      index = i;
    }
  });
  return index;
};

export const getElevation = (lngLat: LngLat) => {
  const e = getMap().queryTerrainElevation(lngLat, { exaggerated: false });
  if (e) return Math.floor(e);
  return null;
};

export const getRouteBoundingBox = (route: Route) => {
  if (!route) return;
  const bbox = {
    sw: {
      lng: -180,
      lat: -90,
    },
    ne: {
      lng: 180,
      lat: 90,
    },
  };
  route.forEach((p) => {
    if (p.lat < bbox.ne.lat) bbox.ne.lat = p.lat;
    if (p.lat > bbox.sw.lat) bbox.sw.lat = p.lat;
    if (p.lng < bbox.ne.lng) bbox.ne.lng = p.lng;
    if (p.lng > bbox.sw.lng) bbox.sw.lng = p.lng;
  });
  return new LngLatBounds([bbox.sw.lng, bbox.sw.lat, bbox.ne.lng, bbox.ne.lat]);
};

export class RouteInserter {
  routeRef: RouteRef;
  lngLat: LngLat;
  elementIndex: number;
  directionsTypeRef: React.MutableRefObject<any>;
  constructor(
    routeRef: RouteRef,
    lngLat: LngLat,
    elementIndex: number,
    directionsTypeRef: React.MutableRefObject<any>
  ) {
    this.routeRef = routeRef;
    this.lngLat = lngLat;
    this.elementIndex = elementIndex;
    this.directionsTypeRef = directionsTypeRef;
  }
  getNext() {
    const nextPoint = this.routeRef.current.find((p, i) => p.cp && i > this.elementIndex);
    return { nextPoint, nextPointIndex: this.routeRef.current.indexOf(nextPoint) };
  }

  getPrevious() {
    const previousPoint = last([...this.routeRef.current].filter((p, i) => p.cp && i < this.elementIndex));
    return { previousPoint, previousPointIndex: this.routeRef.current.indexOf(previousPoint) };
  }

  async insertStartOfRoute(line = false) {
    if (this.routeRef.current.length > 1) {
      const { nextPoint, nextPointIndex } = this.getNext();
      let newDirections: { lng: number; lat: number; e: number; cp?: boolean }[];
      if (line) {
        newDirections = await getDirectionsInLine([
          { lng: this.lngLat.lng, lat: this.lngLat.lat },
          { lng: nextPoint.lng, lat: nextPoint.lat },
        ]);
      } else {
        newDirections = await getDirections([this.lngLat, nextPoint], this.directionsTypeRef.current);
      }
      const np = nearestPoint(this.lngLat, newDirections);
      newDirections[np].cp = true;
      newDirections[0].cp = true;
      this.routeRef.current.splice(0, nextPointIndex);
      return newDirections.concat(this.routeRef.current);
    } else {
      const e = getElevation(this.lngLat);
      return [{ lng: this.lngLat.lng, lat: this.lngLat.lat, e, cp: true }];
    }
  }

  async insertMidRoute(line = false) {
    const { previousPoint, previousPointIndex } = this.getPrevious();
    const { nextPoint, nextPointIndex } = this.getNext();
    let newDirections: { lng: number; lat: number; e: number; cp?: boolean }[];
    if (!line) {
      newDirections = await getDirections([previousPoint, this.lngLat, nextPoint], this.directionsTypeRef.current);
    } else {
      newDirections = await getDirectionsInLine([
        { lng: this.routeRef.current[previousPointIndex].lng, lat: this.routeRef.current[previousPointIndex].lat },
        { lng: this.lngLat.lng, lat: this.lngLat.lat },
      ]);
      const nextPart = await getDirectionsInLine([
        { lng: this.lngLat.lng, lat: this.lngLat.lat },
        { lng: this.routeRef.current[nextPointIndex].lng, lat: this.routeRef.current[nextPointIndex].lat },
      ]);
      newDirections.concat(nextPart).shift();
    }

    const np = nearestPoint(this.lngLat, newDirections);
    newDirections[0].cp = true;
    newDirections[np].cp = true;
    const newRoute = [...this.routeRef.current];
    newRoute.splice(previousPointIndex, nextPointIndex - previousPointIndex, ...newDirections);
    return newRoute;
  }

  async insertEndOfRoute(line = false) {
    const previousPoint = [...this.routeRef.current].reverse().find((p, i) => p.cp && i > 0);
    const previousPointIndex = this.routeRef.current.indexOf(previousPoint);
    let newDirections: { lng: number; lat: number; e: number; cp?: boolean }[];
    if (!line) {
      newDirections = await getDirections([previousPoint, this.lngLat], this.directionsTypeRef.current);
    } else {
      newDirections = await getDirectionsInLine([
        { lng: previousPoint.lng, lat: previousPoint.lat },
        { lng: this.lngLat.lng, lat: this.lngLat.lat },
      ]);
    }
    newDirections[0].cp = true;
    last(newDirections).cp = true;
    this.routeRef.current.splice(previousPointIndex);
    return this.routeRef.current.concat(newDirections);
  }

  getPoints(place?: string) {
    const { previousPoint } = this.getPrevious();
    const { nextPoint } = this.getNext();
    if (place === 'end') return [previousPoint, this.lngLat];
    if (place === 'start') return [this.lngLat, nextPoint];
    return [previousPoint, this.lngLat, nextPoint];
  }

  async roadPreview(place?: string) {
    const previewDirections = await getDirections(this.getPoints(place), this.directionsTypeRef.current);
    draw('preview', getGeoJSON(previewDirections.map((i) => ({ lng: i.lng, lat: i.lat, e: i.e }))));
  }

  linePreview(place?: string) {
    draw('preview', getGeoJSON(this.getPoints(place) as Route));
  }
}

type Listener = { type: keyof MapLayerEventType; listener: (any) => any; layerName?: string };
export class MapEventListenerAdder {
  eventListenerFunctions: Listener[];
  eventListenerFunctionsWithLayer: Listener[];
  constructor() {
    this.eventListenerFunctions = [];
    this.eventListenerFunctionsWithLayer = [];
  }

  removeAll() {
    const map = getMap();
    console.log('REmoving all')
    console.log(this.eventListenerFunctions)
    console.log(this.eventListenerFunctionsWithLayer)
    this.eventListenerFunctions.forEach((listener) =>
      map.off(listener.type, listener.listener)
    );
    this.eventListenerFunctionsWithLayer.forEach((listener) =>
      map.off(listener.type, listener.layerName, listener.listener)
    );
    this.eventListenerFunctions = [];
    this.eventListenerFunctionsWithLayer = [];
  }

  on(listener: Listener) {
    const map = getMap();
    this.eventListenerFunctions.push(listener);
    map.on(listener.type, listener.listener);
  }

  onWithLayer(listener: Listener) {
    if (!listener.layerName)
      return console.error("You must add a layerName with onWithLayer");
    const map = getMap();
    this.eventListenerFunctionsWithLayer.push(listener);
    map.on(listener.type, listener.layerName, listener.listener);
  }

  off(listenerObj: Listener) {
    const map = getMap();
    if (listenerObj.layerName){
      map.off(listenerObj.type, listenerObj.layerName ,listenerObj.listener);
      this.eventListenerFunctionsWithLayer = this.eventListenerFunctionsWithLayer.filter(
        (listener) => listener.listener !== listenerObj.listener
      );
    } else {
      map.off(listenerObj.type, listenerObj.listener);
      this.eventListenerFunctions = this.eventListenerFunctions.filter(
        (listener) => listener.listener !== listenerObj.listener
      );
    }
  }
}
