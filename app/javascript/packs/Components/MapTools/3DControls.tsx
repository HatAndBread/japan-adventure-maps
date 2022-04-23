import React, { useEffect } from 'react';
import { Map } from 'mapbox-gl';
import north from '../../../../assets/images/north.svg';

let rotating = false;
let rotatingPitch = false;
const rotate = (map: Map, direction: 1 | -1) => {
  map.setBearing(map.getBearing() + direction);
  rotating && window.requestAnimationFrame(() => rotate(map, direction));
};

const rotatePitch = (map: Map, direction: 1 | -1) => {
  map.setPitch(map.getPitch() + direction);
  rotatingPitch && window.requestAnimationFrame(() => rotatePitch(map, direction));
};

const Controls3D = ({ map }: { map: Map }) => {
  useEffect(() => {
    return () => {
      rotating = false;
      rotatingPitch = false;
    };
  }, []);
  const start = (num: 1 | -1) => {
    if (map) {
      rotatingPitch = true;
      rotatePitch(map, num);
    }
  };
  const end = () => (rotatingPitch = false);
  return (
    <div className='MapControls3d' style={{ pointerEvents: 'all' }} title='Explore the map in 3D'>
      <table>
        <tbody>
          <tr>
            <td></td>
            <td>
              {' '}
              <button
                className='map-tool-button'
                onMouseDown={() => {
                  start(-1);
                }}
                onMouseUp={end}
                onTouchStart={() => start(1)}
                onTouchEnd={() => end}>
                <i className='fas fa-arrow-up'></i>
              </button>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              {' '}
              <button
                className='map-tool-button'
                onMouseDown={() => {
                  if (map) {
                    rotating = true;
                    rotate(map, 1);
                  }
                }}
                onMouseUp={() => {
                  rotating = false;
                }}>
                <i className='fas fa-arrow-left'></i>
              </button>
            </td>
            <td>
              {' '}
              <button onClick={() => map.resetNorth()} className='map-tool-button'>
                <img src={north} style={{ width: '100%', height: '100%' }}></img>
              </button>
            </td>
            <td>
              {' '}
              <button
                className='map-tool-button'
                onMouseDown={() => {
                  if (map) {
                    rotating = true;
                    rotate(map, -1);
                  }
                }}
                onMouseUp={() => {
                  if (map) {
                    rotating = false;
                  }
                }}>
                <i className='fas fa-arrow-right'></i>
              </button>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              {' '}
              <button
                className='map-tool-button'
                onMouseDown={() => {
                  if (map) {
                    rotatingPitch = true;
                    rotatePitch(map, 1);
                  }
                }}
                onMouseUp={() => {
                  rotatingPitch = false;
                }}>
                <i className='fas fa-arrow-down'></i>
              </button>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Controls3D;
