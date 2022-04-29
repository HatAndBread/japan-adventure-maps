import React, { useEffect, useState } from 'react';
import MapboxMap from '../Components/Map/MapboxMap';
import { MapEventListenerAdder, addMarker, createMarker } from '../../lib/map-logic';
import { LngLat, Map } from 'mapbox-gl';
import { debounce } from 'lodash';
import axios from '../../lib/axios';
import { useAppContext } from '../Context';
import { Ride } from '../Types/Models';
import Modal from '../Components/Modal/Modal';
import { DateTime } from 'luxon';
import placeHolderImage from '../../../assets/images/map.png';
import { useMapSize } from '../Hooks/useMapSize';

const START_ZOOM = 8.5;

const zoomWarning = 'Zoom in closer to search for rides';
const FindRide = () => {
  const map = window.mapboxMap as Map;
  const { profile } = useAppContext().controllerData;
  const [zoomInWarning, setZoomInWarning] = useState(map.getZoom() < 7 ? zoomWarning : '');
  const [rides, setRides] = useState<Ride[]>([]);
  const [rideModalContent, setRideModalContent] = useState<null | Ride>(null);
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
  useMapSize({ height: '100vh' });
  useEffect(() => {
    const markers = [];
    rides.forEach((ride) => {
      const marker = createMarker('start-marker');
      marker.setLngLat(new LngLat(ride.start_lng, ride.start_lat)).setOffset([0, -20]);
      addMarker(marker);
      markers.push(marker);
      marker.getElement().addEventListener('click', () => {
        setRideModalContent(ride);
      });
    });
    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [rides]);
  useEffect(() => {
    const findRides = () => {
      if (map.getZoom() < 7) {
        setZoomInWarning(zoomWarning);
      } else {
        setZoomInWarning('');
        const bounds = map.getBounds();
        axios.post('/api/search_rides', { bounds }).then((res) => Array.isArray(res?.data) && setRides(res.data));
      }
    };
    const onMove = debounce(() => {
      findRides();
    }, 200);
    // @ts-ignore
    mapEventListenerAdder.on({ type: 'move', listener: onMove });
    map.once('idle', findRides);
    map.once('idle', () => {
      if (map.getStyle()?.name !== window.baseMapName) {
        map.setStyle(window.baseMapURL);
      }
    });

    if (profile?.startLng && profile?.startLat) {
      map.jumpTo({ center: new LngLat(profile.startLng, profile.startLat), zoom: START_ZOOM });
    } else if (window.userLocation?.length) {
      map.jumpTo({ center: new LngLat(window.userLocation[0], window.userLocation[1]), zoom: 4 });
    }
    return () => {
      map.off('move', onMove);
    };
  }, []);
  return (
    <div className='FindRide'>
      {rideModalContent && (
        <Modal onClose={() => setRideModalContent(null)}>
          <div className='find-ride-modal'>
            <h1>{rideModalContent.title}</h1>
            <p style={{ marginBottom: '8px' }}>{rideModalContent.description}</p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <a
                className='link-button'
                href={`/rides/${rideModalContent.id}`}
                style={{ width: '100%', maxWidth: '224px', margin: '8px' }}>
                View Ride
              </a>
              <a
                className='link-button'
                href={`/rides/${rideModalContent.id}/three_d`}
                style={{ width: '100%', maxWidth: '224px', margin: '8px' }}>
                3D Tour
              </a>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <ul style={{ marginTop: '8px' }}>
                <li>
                  <strong>Start Time: </strong>
                  {rideModalContent.start_time &&
                    DateTime.fromISO(rideModalContent.start_time).toLocaleString(DateTime.DATETIME_MED)}
                </li>
                <li>
                  <strong>Ride Type: </strong>
                  {rideModalContent.ride_type}
                </li>
                <li>
                  <strong>Distance: </strong>
                  {Math.round(rideModalContent.distance)} km
                </li>
                <li>
                  <strong>Max Elevation: </strong>
                  {rideModalContent.max_elevation} m
                </li>
                <li>
                  <strong>Total Elevation Gain: </strong>
                  {rideModalContent.elevation_gain} m
                </li>
              </ul>
            </div>
            <a href={`/rides/${rideModalContent.id}`}>
              <img
                src={rideModalContent.map_image_url ? rideModalContent.map_image_url : placeHolderImage}
                style={{ maxWidth: '300px', maxHeight: '300px' }}></img>
            </a>
          </div>
        </Modal>
      )}
      {zoomInWarning && <div className='zoom-in-warning'>{zoomInWarning}</div>}
      <MapboxMap />
    </div>
  );
};

export default FindRide;
