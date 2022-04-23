import { number } from 'prop-types';

export type RideWithResponse = {
  data: {
    id: number;
    highlighted_photo_id: number;
    highlighted_photo_checksum: null;
    distance: number;
    elevation_gain: number;
    elevation_loss: number;
    track_id: string;
    user_id: number;
    pavement_type: string;
    pavement_type_id: string;
    recreation_type_ids: [];
    visibility: number;
    created_at: number;
    updated_at: number;
    name: string;
    description: string;
    first_lng: number;
    first_lat: number;
    last_lat: number;
    last_lng: number;
    bounding_box: { lat: number; lng: number }[];
    locality: string;
    postal_code: string;
    administrative_area: string;
    country_code: string;
    privacy_code: null;
    user: null;
    has_course_points: boolean;
    photo_ids: string[];
    points_of_interest: [];
    track_points: { lng: number; lat: number; e: number }[];
  };
  status: number;
  statusText: string;
  headers: any;
  config: any;
};

export type DirectionsResponse = {
  routes: {
    geometry: {
      coordinates: number[][];
      type: string;
    };
    legs: { summary: string; weight: number; duration: number; steps: []; distance: number }[];
    weight_name: string;
    weight: number;
    duration: number;
    distance: number;
  }[];
  waypoints: { distance: number; name: string; location: number }[];
  code: 'Ok' | 'Error';
};
