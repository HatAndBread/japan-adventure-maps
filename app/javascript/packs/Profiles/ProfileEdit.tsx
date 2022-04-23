import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAppContext } from '../Context';
import { useMapSize } from '../Hooks/useMapSize';
import MapboxMap from '../Components/Map/MapboxMap';
import Avatar from '../Components/Avatar';
import ImageUploader from '../Components/ImageUploader';
import QuillEditor from '../Components/Quill/QuillEditor';
import { Profile as ProfileType } from '../Types/ContextProps';
import axios from '../../lib/axios';
import { createMarker } from '../../lib/map-logic';
import { addMarker } from '../../lib/map-logic';
import { cloneDeep, debounce } from 'lodash';
import { LngLat, Map, Marker } from 'mapbox-gl';

const ProfileEdit = () => {
  const profileData = useAppContext().controllerData.profileBeingViewed;
  const [profile, setProfile] = useState<ProfileType>(profileData);
  const [imgSrc, setImageSrc] = useState(profileData.avatar);
  useMapSize({ height: '400px' });
  const firstTime = useRef(true);
  const profileClone = () => cloneDeep(profile);
  useEffect(() => {
    let marker: Marker;
    if (profile) {
      if (profile.startLat && profile.startLng) {
        const map = window.mapboxMap as Map;
        marker = createMarker('home-marker');
        marker.setOffset([0, -20]);
        const lngLat = new LngLat(profile.startLng, profile.startLat);
        marker.setLngLat(lngLat);
        map.jumpTo({ center: lngLat, zoom: 14 });
        addMarker(marker);
      }
    }

    return () => {
      if (marker) marker.remove();
    };
  }, [profile]);
  const url = `/profiles/${profileData.id}`;

  const yearsAgo = (years: number) =>
    new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365.25 * years).toISOString().slice(0, 10);

  return (
    <div className='ProfileEdit'>
      <div className='non-map'>
        <div className='top-row'>
          <div className='avatar-uploader'>
            <ImageUploader
              onImageUploaded={async (imageUrls) => {
                await axios.put(url, { avatar: imageUrls[0] });
                setImageSrc(imageUrls[0]);
              }}
            />
            <Avatar avatarPath={imgSrc} width={120} height={120} />
          </div>
          <form
            className='etc-container'
            onChange={debounce(async (e: ChangeEvent<HTMLFormElement>) => {
              await axios.put(url, { [e.target.id]: e.target.value });
            }, 800)}>
            Location
            <input
              type='text'
              name='location'
              id='location'
              title='location'
              placeholder='Tokyo, Japan'
              defaultValue={profileData.location}
            />
            Bikes
            <input
              type='text'
              title='bikes'
              name='bikes'
              id='bikes'
              placeholder='1963 Bianchi Campione d’Italia, 2023 Trek Emonda'
              defaultValue={profileData.bikes}
            />
            Birthday
            <input
              type='date'
              name='birthday'
              id='birthday'
              title='birthday'
              min={yearsAgo(130)}
              max={yearsAgo(12)}
              defaultValue={profileData.birthday?.slice(0, 10)}
            />
          </form>
        </div>
        <div className='intro-container'>
          <QuillEditor
            setDelta={debounce(async (intro) => {
              if (!firstTime.current) {
                await axios.put(url, { intro });
              }
              if (firstTime.current) firstTime.current = false;
            }, 800)}
            startStateDelta={profile.intro}
            textAreaHeight={200}
            placeHolder='Introduce yourself'
            focusOnStart={true}
          />
        </div>
      </div>
      <div className='profile-map-container'>
        <h1>{profileData.startLng ? 'Set your' : 'Add a'} default starting point</h1>
        <MapboxMap
          onClick={async (e) => {
            const clone = profileClone();
            clone.startLng = e.lngLat.lng;
            clone.startLat = e.lngLat.lat;
            await axios.put(url, {
              start_lng: e.lngLat.lng,
              start_lat: e.lngLat.lat,
            });
            setProfile(clone);
          }}
        />
      </div>
    </div>
  );
};

export default ProfileEdit;
