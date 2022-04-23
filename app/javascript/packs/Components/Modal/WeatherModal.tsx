import React from 'react';
import { Weather } from '../../Types/Models';
import Image from '../Image';

const WeatherModal = ({ weather }: { weather: Weather }) => {
  const dayOfWeek = (i: number) => {
    const dString = (d: Date) => d.toDateString().slice(0, 3) + ', ' + d.toDateString().slice(4, 15);
    const today = new Date();
    if (!i) return dString(today);
    const nextDay = new Date(today);
    return dString(new Date(nextDay.setDate(nextDay.getDate() + i)));
  };
  return (
    <div className='weather-modal'>
      {weather.map((weath, i) => {
        return (
          <div className='weather-day' key={i}>
            <h2>{dayOfWeek(i)} </h2>
            <div>High: {Math.round(weath.high)}°</div>
            <div>Low: {Math.round(weath.low)}°</div>
            <Image src={weath.iconUrl} altSrc={''} className='weather-image' alt={weath.weather + ' icon'} />
            {i < weather.length - 1 && <div className='divider'></div>}
          </div>
        );
      })}
    </div>
  );
};

export default WeatherModal;
