import { RideWithResponse } from '../packs/Types/RideWithResponse';
import { Route, moveStartMarker, addMarker } from './map-logic';
import axios from './axios';
import { LngLat } from 'mapbox-gl';

const ValidateRideWithURL = (rideWithURL: string) => {
  if (!rideWithURL) return;
  let match = rideWithURL.match(/ridewithgps.com\/routes\/\d+$/);
  if (!match) match = rideWithURL.match(/ridewithgps.com\/trips\/\d+$/);
  if (!match) return;
  return 'https://' + rideWithURL.substring(match.index) + '.json';
};

export const rwgpsImport = async (
  e: React.FormEvent<HTMLFormElement>,
  rideWithURL: string,
  setRouteFromScratch: (route: Route) => void
) => {
  e.preventDefault();
  const url = ValidateRideWithURL(rideWithURL);
  if (!url) {
    alert('Invalid Ride With GPS URL.');
    return;
  }
  const res = (await axios.post('/api/post_ride_with', { url })) as RideWithResponse;
  setRouteFromScratch(res.data.track_points);
};
