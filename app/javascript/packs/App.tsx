import React from 'react';
import { AppContext } from './Context';
import Home from './Pages/Home';
import Ride from './Rides/Ride';
import FindRide from './Rides/FindRide';
import ProfileEdit from './Profiles/ProfileEdit';
import ProfileShow from './Profiles/ProfileShow';
import ThreeD from './Rides/ThreeD';

const App = ({ controllerData }: { controllerData: any }) => {
  if (controllerData.env === 'development') console.log(controllerData);
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
    <AppContext.Provider value={{ controllerData }}>
      <div className='App'>{getComponents()}</div>
    </AppContext.Provider>
  );
};

export default App;
