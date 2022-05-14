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
  const { route, description, setDescription, startTime, setStartTime, title, setTitle, popups, startLocationEn, startLocationJp } = rideCtx;
  const [loading, setLoading] = useState(false);
  const [rideId, setRideId] = useState<number>(ctx.controllerData?.ride?.id);
  const [status, setStatus] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [imageURL, setImageURL] = useState<string>();
  const [rideType, setRideType] = useState(ctx?.controllerData?.ride?.rideType || 'hiking');
  const [isPrivate, setIsPrivate] = useState(ctx?.controllerData?.ride?.isPrivate);
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
      ride_type: rideType,
      is_private: isPrivate,
      start_location_en: startLocationEn,
      start_location_jp: startLocationJp,
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
      <div className="MapForm">
        {loading && <MyLoader />}
        {status === "neutral" && (
          <Form action="/ride" method="POST" onSubmit={formSubmit}>
            <input
              type="text"
              name="title"
              id="title"
              title="Route name"
              placeholder={`Your route's name`}
              defaultValue={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <textarea
              name="description"
              id="ride-description"
              cols={32}
              rows={10}
              defaultValue={description}
              placeholder="Describe your route"
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <label htmlFor="ride-type-select">
              Ride type{" "}
              <select
                id="ride-type-selct"
                defaultValue={rideType}
                onChange={(e) => setRideType(e.target.value)}
                title="Select ride type"
              >
                <option value="hiking">Hiking</option>
                <option value="cycling">Cycling</option>
              </select>
            </label>
            <label htmlFor="private-radio">
              Share this route with others
              <input
                type="checkbox"
                id="private-radio"
                defaultChecked={!isPrivate}
                onClick={() => {
                  setIsPrivate(!isPrivate);
                }}
              />
            </label>
            <button
              className="save-form-button"
              type="submit"
              ref={saveButtonRef}
            >
              Save
            </button>
            {!isNew && (
              <button className="save-form-button" onClick={saveAsNew}>
                Save as new
              </button>
            )}
          </Form>
        )}
        {status === "success" && (
          <div className="success-screen">
            <p>Your route has successfully been saved.</p>
            <button onClick={editRoute}>Continue editing</button>
            <button onClick={viewRoute}>View route</button>
          </div>
        )}
        {status === "error" && <div>Something went wrong.</div>}
      </div>
    </Modal>
  );
};

export default MapForm;
