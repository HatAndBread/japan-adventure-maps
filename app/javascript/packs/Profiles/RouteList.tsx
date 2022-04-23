import React, { useState } from 'react';
import { Ride } from '../Types/ContextProps';
import { useAppContext } from '../Context';
import axios from '../../lib/axios';
import { DateTime } from 'luxon';
import Image from '../Components/Image';
import altImage from '../../../assets/images/map.png';

const RouteList = ({
  title,
  routes,
  belongsToCurrentUser,
}: {
  title: string;
  routes: Ride[];
  belongsToCurrentUser: boolean;
}) => {
  const [rides, setRides] = useState(routes);
  const data = useAppContext().controllerData;
  return (
    <div className='RouteList'>
      <ul className='routes-list'>
        <h1>{title === 'My Routes' && !belongsToCurrentUser ? 'Routes' : title}</h1>

        {!rides?.length && title === 'My Routes' ? (
          <>
            <p>Looks like you don't have any routes yet. </p>
            <a href={`/rides/new`} className='link-button'>
              Create a Route
            </a>
          </>
        ) : (
          !rides?.length && (
            <>
              <p>Looks like you don't have any upcoming rides. </p>
              <a href={`/find_a_ride`} className='link-button'>
                Join a Ride
              </a>
            </>
          )
        )}
        {rides?.map((route) => (
          <li key={route.id}>
            <div className='ride-preview-container'>
              {title === 'My Routes' && belongsToCurrentUser && (
                <div className='buttons'>
                  <>
                    <a href={`/rides/${route.id}/edit`} className='link'>
                      <i className='fas fa-edit'></i>
                    </a>
                    <a
                      className='link'
                      rel='nofollow'
                      onClick={async (e) => {
                        const confirmation = confirm(
                          'Are you sure you want to delete this ride? Once it is deleted it is gone forever.'
                        );
                        if (!confirmation) {
                          e.preventDefault();
                        } else {
                          await axios.delete(`/rides/${route.id}`);
                        }
                      }}
                      href='#'>
                      <i className='fas fa-trash'></i>
                    </a>
                  </>
                </div>
              )}
              {route.userId === data.currentUser.id && title === 'Upcoming Rides' && (
                <div className='leader-tag'>✩Leader✩</div>
              )}
              <div className='title-row'>
                {route.startTime && title === 'Upcoming Rides' ? (
                  <a className='link' href={`/rides/${route.id}`}>
                    {route.title || 'View Route'} (
                    {DateTime.fromISO(route.startTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)})
                  </a>
                ) : (
                  <a className='link' href={`/rides/${route.id}`}>
                    {route.title || 'View Route'}
                  </a>
                )}
              </div>
              <div className='row'>
                <p>{route.description}</p>
                <div className='map-preview-image-container'>
                  <a href={`/rides/${route.id}`}>
                    <Image src={route.mapImageUrl} altSrc={altImage} alt='Image Of Map'></Image>
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RouteList;
