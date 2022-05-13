import React, { useEffect, useState } from 'react';
import { AppContext } from './Context';
import Home from './Pages/Home';
import Ride from './Rides/Ride';
import {Ride as RideType} from './Types/Models';
import FindRide from './Rides/FindRide';
import ProfileEdit from './Profiles/ProfileEdit';
import ProfileShow from './Profiles/ProfileShow';
import ThreeD from './Rides/ThreeD';
import axios from '../lib/axios';
import { Map } from 'mapbox-gl';

const App = ({ controllerData }: { controllerData: any }) => {
  if (controllerData.env === 'development') console.log(controllerData);
  const [allRides, setAllRides] = useState<RideType[]>([]);
  const [mapReady, setMapReady] = useState(!!window.mapFinishedLoading);
  useEffect(()=> {
    const map = window.mapboxMap as Map;
    map.on('styledata', () => {
      if (!mapReady) setMapReady(true);
      window.mapFinishedLoading = true;
    });
    const getAllRides = async () => {
      const allRidesData = await axios.get('/all_rides');
      const rides = allRidesData.data.data.map((d)=> d.attributes) as RideType[];
      setAllRides(rides);
    };
    getAllRides();
  }, []);
  const getComponents = () => {
    // Render your entry component for each view here ✨😘
    switch (controllerData.controllerAction) {
      case 'pages#home':
        return <Home />;
      case 'rides#show':
        return <Ride />;
      case 'rides#new':
        return <Ride />;
      case 'rides#edit':
        return <Ride />;
      case 'rides#find_a_ride':
        return <FindRide />;
      case 'rides#three_d':
        return <ThreeD />;
      case 'profiles#show':
        return <ProfileShow />;
      case 'profiles#edit':
        return <ProfileEdit />;
      default:
        return <></>;
    }
  };
  return (
    <AppContext.Provider value={{ controllerData, allRides, mapReady }}>
      <div className='App'>{getComponents()}</div>
    </AppContext.Provider>
  );
};

export default App;
