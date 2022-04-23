import React, { useState, useEffect, useRef } from 'react';
import Form from '../Form/Form';
import Modal from '../../Components/Modal/Modal';
import axios from '../../../lib/axios';
import { useAppContext } from '../../Context';
import MyLoader from '../MyLoader';
import { useRideContext } from '../../Rides/Ride';
import {
  getRouteBoundingBox,
  routeDistance,
  elevationGain,
  maxElevation,
  elevationChangeCalculation,
} from '../../../lib/map-logic';
import { Map } from 'mapbox-gl';
import { getElevationGain } from '../../../lib/geojson-elevation.js';
import { uploadToCloudinary } from '../../../lib/uploadToCloudinary';

const MapForm = ({ setShowForm }: { setShowForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const ctx = useAppContext();
  const rideCtx = useRideContext();
  const map = window.mapboxMap as Map;
  const user_id = ctx.controllerData?.currentUser?.id;
  const controller = ctx.controllerData?.controllerAction;
  const [isNew, setIsNew] = useState(controller === 'rides#new');
  const [saveEditAsNew, setSaveEditAsNew] = useState(false);
  const { route, description, setDescription, startTime, setStartTime, title, setTitle, popups } = rideCtx;
  const [loading, setLoading] = useState(false);
  const [rideId, setRideId] = useState<number>(ctx.controllerData?.ride?.id);
  const [status, setStatus] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [imageURL, setImageURL] = useState<string>();
  const [rideType, setRideType] = useState(ctx?.controllerData?.ride?.rideType || 'Mixed');
  const [isEvent, setIsEvent] = useState(ctx.controllerData?.ride?.isEvent ? true : false);
  const saveButtonRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    const boundingBox = getRouteBoundingBox(route);
    map.fitBounds(boundingBox, { animate: false, padding: 100 });
    map.once('idle', () => {
      const image = map.getCanvas().toBlob((blob) => {
        uploadToCloudinary([blob]).then((url) => setImageURL(url[0]));
      });
    });
  }, [route]);
  const viewRoute = () => {
    // reset the map here
    window.location.replace(`/rides/${rideId}`);
  };
  const editRoute = () => {
    if (isNew) {
      return window.location.replace(`/rides/${rideId}/edit`);
    }
    window.location.reload();
  };
  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) return alert('Please give your route a name.');
    if (isEvent && !description) return alert('You must add a description to create an event.');
    if (isEvent && !rideType) return alert('You must select a ride type to create an event.');
    if (isEvent && !startTime) return alert('You must add a start time to create an event.');
    const bodyObject = {
      description,
      user_id,
      title,
      route: JSON.stringify(route),
      popups: JSON.stringify(popups),
      start_lng: route[0] ? route[0].lng : null,
      start_lat: route[0] ? route[0].lat : null,
      start_time: startTime,
      distance: routeDistance(route),
      elevation_gain: getElevationGain(route),
      max_elevation: maxElevation(route),
      elevation_change: Math.floor(elevationChangeCalculation(route)),
      is_event: isEvent,
      ride_type: rideType,
    };
    //@ts-ignore
    if (imageURL) bodyObject.map_image_url = imageURL;
    setLoading(true);
    let res;
    try {
      if (isNew) {
        res = await axios.post('/rides', bodyObject);
      } else {
        res = await axios.put(`/rides/${ctx.controllerData.ride.id}`, bodyObject);
      }
      if (res.data.success) {
        localStorage.removeItem('newRoute');
        localStorage.removeItem('newPopups');
        localStorage.removeItem('editRoute');
        localStorage.removeItem('editPopups');
        localStorage.removeItem('editId');
        setRideId(res.data.ride_id);
        setLoading(false);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };
  const rideTypeOptions = [
    { value: 'Mixed', label: 'Mixed' },
    { value: 'Gravel', label: 'Gravel' },
    { value: 'Mountain', label: 'Mountain' },
    { value: 'Road', label: 'Road' },
    { value: 'Race', label: 'Race' },
  ];
  const selectStyles = {
    menuList: (provided, state) => ({
      ...provided,
      position: 'fixed',
      backgroundColor: 'white',
      borderRadius: '6px',
      width: '258px',
    }),
  };
  const saveAsNew = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (title === ctx.controllerData?.ride?.title) setTitle(title + ' copy');
    setIsNew(true);
    setSaveEditAsNew(true);
  };

  useEffect(() => {
    if (!isNew && saveButtonRef.current) return;
    if (saveEditAsNew) saveButtonRef.current.click();
  }, [isNew, saveEditAsNew]);
  return (
    <Modal onClose={() => setShowForm(false)}>
      <div className='MapForm'>
        {loading && <MyLoader />}
        {status === 'neutral' && (
          <Form action='/ride' method='POST' onSubmit={formSubmit}>
            <input
              type='text'
              name='title'
              id='title'
              title='Route name'
              placeholder={isEvent ? `Your event's name` : `Your route's name`}
              defaultValue={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <textarea
              name='description'
              id='ride-description'
              cols={32}
              rows={10}
              defaultValue={description}
              placeholder={
                isEvent
                  ? 'Please enter a detailed description of this event. What can participants expect? What should they know before they join?'
                  : 'Describe your route'
              }
              onChange={(e) => setDescription(e.target.value)}></textarea>
            <label htmlFor='ride-type-select'>
              Ride type{' '}
              <select
                id='ride-type-selct'
                defaultValue={rideType}
                onChange={(e) => setRideType(e.target.value)}
                title='Select ride type'>
                <option value='Mixed'>Mixed</option>
                <option value='Gravel'>Gravel</option>
                <option value='Road'>Road</option>
                <option value='Mountain'>Mountain</option>
                <option value='Race'>Race</option>
              </select>
            </label>
            {isEvent && (
              <label
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                {' '}
                Set a date and time for your event
                <br />
                <input
                  type='datetime-local'
                  name='ride-time'
                  id='ride-time'
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
            )}
            <button
              className='save-form-button'
              onClick={(e) => {
                e.preventDefault();
                if (isEvent) return setIsEvent(false);
                setIsEvent(true);
              }}>
              {isEvent ? 'Make Ride Private' : 'Make A Public Event'}
            </button>
            <button className='save-form-button' type='submit' ref={saveButtonRef}>
              Save
            </button>
            {!isNew && (
              <button className='save-form-button' onClick={saveAsNew}>
                Save as new
              </button>
            )}
          </Form>
        )}
        {status === 'success' && (
          <div className='success-screen'>
            <p>Your route has successfully been saved.</p>
            <button onClick={editRoute}>Continue editing</button>
            <button onClick={viewRoute}>View route</button>
          </div>
        )}
        {status === 'error' && <div>Something went wrong.</div>}
      </div>
    </Modal>
  );
};

export default MapForm;
