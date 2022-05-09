import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRideContext } from '../../Rides/Ride';
import { Map } from 'mapbox-gl';
import { useAppContext } from '../../Context';
import { Route, drawRoute, draw } from '../../../lib/map-logic';
import { last } from 'lodash';
import toolbox from '../../../../assets/images/toolbox.svg';
import Exporter from '../../../lib/Exporter';
import Modal from '../Modal/Modal';
import LikeButton from '../LikeButton';

const MapTools = ({
  setPreviousTool,
  undoHistory,
  routeHistory,
}: {
  setPreviousTool: React.Dispatch<React.SetStateAction<string>>;
  undoHistory: Route[];
  routeHistory: Route[];
}) => {
  const map = window.mapboxMap as Map;
  const ctx = useAppContext();
  const likesUserIds = useMemo(()=> ctx.controllerData?.likes?.map((like)=> like.userId), [])
  const userId = ctx.controllerData?.currentUser?.id;
  const likeableId = ctx.controllerData?.ride?.id
  const creatorId = ctx.controllerData?.ride?.userId;
  const [showTools, setShowTools] = useState(window.isProbablyDesktop);
  const [showExportModal, setShowExportModal] = useState(false);
  const [fileFormat, setFileFormat] = useState('.gpx');
  const ref = useRef<HTMLDivElement>();
  const {
    directionsType,
    setDirectionsType,
    route,
    setRoute,
    setDistance,
    setElevationChange,
    setShowForm,
    setShowRideWithModal,
    title,
    tool,
    setTool,
    setPopups,
    isEditor,
    setLoaderText,
  } = useRideContext();
  const [showLike, setShowLike] = useState(!isEditor && creatorId !== userId && !likesUserIds.includes(userId));
  const [likesCount, setLikesCount] = useState(likesUserIds.length)
  const getStyle = (myTool: string) =>
    myTool === tool ? { borderColor: '#0bda51', boxShadow: '0 0 2px 2px #0bda51' } : {};
  const handleClick = (type: string) => {
    window.isProbablyNotDesktop && setShowTools(false);
    setPreviousTool(tool);
    setTool(type);
  };
  
  const clearMap = () => {
    const confirmed = window.confirm('Are you sure you want to clear this map?');
    if (confirmed) {
      setRoute([]);
      setDistance(0);
      setElevationChange(0);
      setPopups([]);
      undoHistory = [];
      routeHistory = [];
    }
  };

  const undo = () => {
    if (routeHistory.length <= 1) {
      setRoute(null);
      drawRoute([]);
      routeHistory.pop;
      return;
    }
    undoHistory.push(route);
    routeHistory.pop();
    setRoute(last(routeHistory) || []);
  };

  const redo = () => {
    if (!undoHistory.length) return;
    const lastState = undoHistory.pop();
    setRoute(lastState);
  };

  const save = () => {
    if (!route.length) return alert('Please create a route before saving.');
    if (!ctx.controllerData.currentUser) return alert('Please sign in to save your route.');
    setShowForm(true);
  };
  const hideMapTools = () => {
    ref.current.style.opacity = '0';
    setTimeout(() => {
      setShowTools(false);
    }, 300);
  };

  const exportToGpx = () => {
    new Exporter({ route, routeName: title }).download(fileFormat);
  };

  const getToolName = () => {
    switch (tool) {
      case 'point':
        return 'Add To Route';
      case 'line':
        return 'Add Lines';
      case 'cp':
        return 'Control Points';
      case 'google':
        return 'Google Street View';
      case 'pop-up':
        return 'Add Point Of Interest';
      case 'flickr':
        return 'Image Search';
      case 'info':
        return 'Info';
      case 'no-tools':
        return 'No tools';
      case 'weather':
        return 'Weather';
      default:
        return tool;
    }
  };

  useEffect(() => {
    if (showTools && ref.current) {
      ref.current.style.opacity = '1';
    }
  }, [showTools, ref]);

  if (showTools)
    return (
      <div className='MapTools' ref={ref}>
        {showExportModal && (
          <Modal onClose={() => setShowExportModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2>Export {title}</h2>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor='format'>Choose your file format</label>{' '}
                <select defaultValue={fileFormat} name='format' onChange={(e) => setFileFormat(e.target.value)}>
                  <option value='.gpx'>.gpx</option>
                  <option value='.kml'>.kml</option>
                  {/* <option value='.tcx'>.tcx</option> TODO  */}
                </select>
              </div>
              <button
                onClick={() => {
                  window.isProbablyMobile && setShowTools(false);
                  exportToGpx();
                }}>
                Export
              </button>
            </div>
          </Modal>
        )}
        <div className='closer' onClick={hideMapTools}>
          <i className='fas fa-times pointer'></i>
        </div>
        <div style={{color: 'darkred'}}>
          <i className='fa fa-heart'></i>
          <span style={{position: 'relative', top: '-4px', fontSize: '11px'}}>{likesCount}</span>
        </div>
        <div style={{ color: 'rgba(180,120,120, 0.9)' }}>Dirt Road: ----</div>
        <div style={{ color: 'rgba(180,40,250, 0.6)' }}>Bike Path: ----</div>
        <div style={{ color: 'rgba(23, 136, 0, 1)' }}>Foot Path: ----</div>
        {showLike &&
          <button
            className='map-tool-button'
            title='Save to database'
            onClick={(e) => {
              const target = e.target as HTMLDivElement;
              const btn = target.children[0] as HTMLElement;
              try {
                btn.click();
                setTimeout(()=>{
                  setLikesCount(likesCount + 1);
                  setShowLike(false);
                }, 200);
              }catch{}
            }}>
          <span style={{display: 'flex', justifyContent: 'center', alignItems: 'end', width: '100%'}}>
              <LikeButton userId={userId} likeableId={likeableId} likeableType='Ride' size='fa-lg'/>&nbsp; Like
          </span>
          </button>
        }
        {isEditor && (
          <button
            className='map-tool-button'
            title='Save to database'
            onClick={() => {
              window.isProbablyMobile && setShowTools(false);
              save();
            }}>
            <i className='fas fa-save big-icon'></i> Save
          </button>
        )}
        {route?.length ? (
          <button
            className='map-tool-button'
            title='Export to gpx or kml file'
            onClick={() => {
              setShowExportModal(true);
            }}>
            <div>
              <i className='fas fa-file-export big-icon' /> Export
            </div>
          </button>
        ) : (
          <button
            className='map-tool-button'
            title='Import from gpx or kml file'
            onClick={() => {
              window.isProbablyMobile && setShowTools(false);
              setShowRideWithModal(true);
            }}>
            <div>
              <i className='fas fa-file-import big-icon'></i> Import
            </div>
          </button>
        )}
        {ctx.controllerData.currentUser?.id &&
          ctx.controllerData.ride?.userId &&
          ctx.controllerData.currentUser.id === ctx.controllerData.ride.userId &&
          ctx.controllerData.controllerAction === 'rides#show' && (
            <button
              className='map-tool-button'
              title='Edit this map'
              onClick={() => {
                window.location.replace(`/rides/${ctx.controllerData.ride.id}/edit`);
              }}>
              <div>
                <i className='fas fa-edit big-icon'></i> Edit
              </div>
            </button>
          )}
        {!isEditor && (
          <button
            onClick={() => {
              window.location.replace(`/rides/${ctx.controllerData.ride.id}/three_d`);
            }}
            title='3D Tour'
            className='map-tool-button big-icon'>
            <div>
              <i className='fas fa-cube big-icon'></i> 3D Tour
            </div>
          </button>
        )}
        <div className='tool-name-display'>
          <div style={{ textDecoration: 'underline' }}>Current Tool</div>
          <div>{getToolName()}</div>
        </div>
        {isEditor && (
          <div className='tool-row'>
            <button
              style={getStyle('point')}
              onClick={() => handleClick('point')}
              title='Follow roads'
              className='map-tool-button three-buttons big-icon'>
              <i className='fas fa-route'></i>
            </button>
            <button
              style={getStyle('line')}
              onClick={() => handleClick('line')}
              className='map-tool-button three-buttons big-icon'
              title='Draw lines'>
              <i className='fas fa-draw-polygon'></i>
            </button>
            <button
              style={getStyle('cp')}
              title='Control point'
              onClick={() => handleClick('cp')}
              className='map-tool-button three-buttons'>
              <i className='fas fa-dot-circle'></i>
            </button>
          </div>
        )}
        {!isEditor && (
          <div className='tool-row'>
            <button
              style={getStyle('no-tools')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('no-tools')}
              title='No tools'>
              <i className='fas fa-mouse-pointer'></i>
            </button>
            <button
              style={getStyle('google')}
              title='Google Street View'
              onClick={() => handleClick('google')}
              className='map-tool-button three-buttons big-icon'>
              <i className='fas fa-street-view'></i>
            </button>
            <button
              style={getStyle('flickr')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('flickr')}
              title='Search for photographs from this location'>
              <i className='fas fa-camera'></i>
            </button>
            <button
              style={getStyle('info')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('info')}
              title='Get info about this location'>
              <i className='fas fa-info'></i>
            </button>
            <button
              style={getStyle('weather')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('weather')}
              title='No tools'>
              <i className='fas fa-cloud-sun'></i>
            </button>
          </div>
        )}
        {isEditor && (
          <div className='tool-row'>
            <button className='map-tool-button three-buttons big-icon' title='undo' onClick={undo}>
              <i className='fas fa-undo'></i>
            </button>
            <button className='map-tool-button three-buttons big-icon' title='redo' onClick={redo}>
              <i className='fas fa-redo'></i>
            </button>
            <button className='map-tool-button three-buttons big-icon' title='Clear map' onClick={clearMap}>
              <i className='fas fa-trash'></i>
            </button>
          </div>
        )}
        {isEditor && (
          <div className='tool-row'>
            <button
              style={getStyle('pop-up')}
              onClick={() => handleClick('pop-up')}
              title='Point of interest'
              className='map-tool-button three-buttons big-icon'>
              <i className='fas fa-map-pin'></i>
            </button>
            <button
              style={getStyle('google')}
              title='Google Street View'
              onClick={() => handleClick('google')}
              className='map-tool-button three-buttons big-icon'>
              <i className='fas fa-street-view'></i>
            </button>
            <button
              style={getStyle('flickr')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('flickr')}
              title='Search for photographs from this location'>
              <i className='fas fa-camera'></i>
            </button>
          </div>
        )}
        {isEditor && (
          <div className='tool-row'>
            <button
              style={getStyle('no-tools')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('no-tools')}
              title='No tools'>
              <i className='fas fa-mouse-pointer'></i>
            </button>
            <button
              style={getStyle('info')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('info')}
              title='Get info about this location'>
              <i className='fas fa-info'></i>
            </button>
            <button
              style={getStyle('weather')}
              className='map-tool-button three-buttons big-icon'
              onClick={() => handleClick('weather')}
              title='No tools'>
              <i className='fas fa-cloud-sun'></i>
            </button>
          </div>
        )}
        {isEditor && (
          <div className='tool-row'>
            <select
              defaultValue={directionsType}
              onChange={(e) => setDirectionsType(e.target.value)}
              title='Directions type'
              style={{ width: '100%', margin: '4px' }}>
              <option value='walking'>Walking</option>
              <option value='cycling'>Cycling</option>
              <option value='driving'>Driving</option>
            </select>
          </div>
        )}
      </div>
    );

  return (
    <>
      <img
        src={toolbox}
        width='40'
        title='Map Tools'
        className='tool-box-icon pointer'
        onClick={() => setShowTools(true)}
        alt='ToolBox'></img>
      {isEditor && (
        <div className='no-tools-undo'>
          <div>
            {tool === 'cp' && (
              <div className={'nt-container'}>
                <i className='fas fa-dot-circle big-icon'></i>
              </div>
            )}
            {tool === 'line' && (
              <div className={'nt-container'}>
                <i className='fas fa-draw-polygon big-icon'></i>
              </div>
            )}
            {tool === 'point' && (
              <div className={'nt-container'}>
                <i className='fas fa-route big-icon'></i>
              </div>
            )}
            {tool === 'pop-up' && (
              <div className={'nt-container'}>
                <i className='fas fa-map-pin big-icon'></i>
              </div>
            )}
            {tool === 'google' && (
              <div className={'nt-container'}>
                <i className='fas fa-street-view big-icon'></i>
              </div>
            )}
            {tool === 'flickr' && (
              <div className={'nt-container'}>
                <i className='fas fa-camera big-icon'></i>
              </div>
            )}
            {tool === 'info' && (
              <div className={'nt-container'}>
                <i className='fas fa-info big-icon'></i>
              </div>
            )}
            {tool === 'weather' && (
              <div className={'nt-container'}>
                <i className='fas fa-cloud-sun big-icon'></i>
              </div>
            )}
          </div>
          <button className='map-tool-button three-buttons big-icon' title='undo' onClick={undo}>
            <i className='fas fa-undo'></i>
          </button>
          <button className='map-tool-button three-buttons big-icon' title='redo' onClick={redo}>
            <i className='fas fa-redo'></i>
          </button>
        </div>
      )}
    </>
  );
};

export default MapTools;
