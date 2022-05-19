import { LngLat } from 'mapbox-gl';
import { Route } from '../../lib/map-logic';
export type Popups = { markerColor: string; lngLat: LngLat; delta: string; }[];

export type Ride = {
  created_at: string;
  description: string;
  id: number;
  mapImageUrl: string;
  startLat: number;
  startLng: number;
  startTime: string;
  title: string;
  updatedAt: string;
  distance: number;
  elevationGain: number;
  elevationChange: number;
  maxElevation: number;
  rideType: string;
  isPrivate: boolean;
  isEvent: boolean;
  likesCount?: number;
  featuredImages: string;
  startLocationEn: string;
  startLocationJp: string;
};

export type RideContextProps = {
  route: Route;
  setRoute: (newRoute: Route) => void;
  routeRef: React.MutableRefObject<Route>;
  setRouteFromScratch: (route: Route) => void;
  tool;
  toolRef: React.MutableRefObject<any>;
  setTool: React.Dispatch<any>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  popups;
  setPopups: React.Dispatch<any>;
  setPopupPos: React.Dispatch<React.SetStateAction<LngLat>>;
  popupsRef: React.MutableRefObject<any>;
  hoveringOverMarkerRef: React.MutableRefObject<boolean>;
  directionsType: string;
  directionsTypeRef: React.MutableRefObject<any>;
  setDirectionsType: React.Dispatch<any>;
  draggingPointIndex: React.MutableRefObject<number>;
  draggingControlPoint: React.MutableRefObject<boolean>;
  setElevationDistanceDisplay: React.Dispatch<
    React.SetStateAction<{
      distance: number;
      elevation: number;
      x: number;
      y: number;
    }>
  >;
  isEditor: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRideWithModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDistance: React.Dispatch<React.SetStateAction<number>>;
  setElevationChange: React.Dispatch<React.SetStateAction<number>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  startLocationEn: string;
  startLocationJp: string;
};

export type Weather = {
  high: number;
  low: number;
  humidity: number;
  rain: number;
  weather: string;
  iconUrl: string;
}[];

export type Mountain =
  | {
      imageURL: string | undefined;
      wikiurls: string[] | undefined;
      name: string | undefined;
      elevation: string | number | undefined;
      prominence: string | number | undefined;
    }
  | undefined;

export type Cave =
  | {
      imageURL: string | undefined;
      wikiurls: string[] | undefined;
      name: string | undefined;
    }
  | undefined;

export type Waterfall =
  | {
      imageURL: string | undefined;
      wikiurls: string[] | undefined;
      name: string | undefined;
    }
  | undefined;

export type Bed =
  | {
      url: string | undefined;
      name: string | undefined;
      type: string | undefined;
    }
  | undefined;


export type Hut =
  | {
      url: string | undefined;
      name: string | undefined;
      nameEn: string | undefined;
    }
  | undefined;

export type Camp =
  | {
      url: string | undefined;
      name: string | undefined;
    }
  | undefined;

export type TrackModalData =
  | {
      url: string | undefined;
      name: string | undefined;
    }
  | undefined;

export type PathModalData =
  | {
      name: string | undefined;
      'name:en': string | undefined;
      highway: string;
    }
  | undefined;
