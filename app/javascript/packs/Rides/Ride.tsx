import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { addMarker, moveStartMarker, Route } from '../../lib/map-logic';
import { getClickFunc } from '../../lib/mapClickFunctions';
import { useAppContext } from '../Context';
import { Map, LngLat } from 'mapbox-gl';
import { addLayersAndSources } from '../application.js';
import MapboxMap from '../Components/Map/MapboxMap';
import ElevationProfile from '../Components/MapTools/ElevationProfile';
import MapTools from '../Components/MapTools/MapTools';
import EventShow from '../Components/Map/EventShow';
import Controls3D from '../Components/MapTools/3DControls';
import streetViewCursor from '../../../assets/images/street-view.png';
import crossHairCursor from '../../../assets/images/crosshair.png';
import cameraCursor from '../../../assets/images/camera.png';
import infoCursor from '../../../assets/images/information.png';
import pinPointCursor from '../../../assets/images/pin-point.png';
import controlPointCursor from '../../../assets/images/control-point.png';
import weatherCursor from '../../../assets/images/weather.png';
import MapForm from '../Components/Map/MapForm';
import Modal from '../Components/Modal/Modal';
import MapPopUpEditor from '../Components/MapTools/MapPopUpEditor';
import Loader from '../Components/Loader';
import { useStateRef } from '../Hooks/useStateRef';
import { UseControlPoints } from '../Hooks/useControlPoints';
import { UsePopups } from '../Hooks/usePopups';
import { useRouteUpdate } from '../Hooks/useRouteUpdate';
import { useMapSize } from '../Hooks/useMapSize';
import { UseMapInitialization } from '../Hooks/UseMapInitialization';
import UseLocalStorage from '../Hooks/UseLocalStorage';
import useLayers from '../Hooks/useLayers';
import { UseMapListenerInitialization } from '../Hooks/useMapListenerInitialization';
import { UseFixMissingElevations } from '../Hooks/useFixMissingElevations';
import ElevationDistanceDisplayer from '../Components/Map/ElevationDistanceDisplayer';
import { RideContextProps, Weather, Mountain, PathModalData } from '../Types/Models';
import { openFile } from '../../lib/FileOpener';
import { importer } from '../../lib/importer';
import FlickrModal from '../Components/Modal/FlickrModal';
import WikiModal from '../Components/Modal/WikiModal';
import WeatherModal from '../Components/Modal/WeatherModal';
import MountainModal from '../Components/Modal/MountainModal';
import PathModal from '../Components/Modal/PathModal';

export const RideContext = createContext<Partial<RideContextProps>>({});
export const useRideContext = () => useContext(RideContext);
let routeHistory: Route[] = [];
let undoHistory: Route[] = [];

const Ride = () => {
  const ctx = useAppContext();
  const data = ctx.controllerData;
  const isEditor = ['rides#new', 'rides#edit'].includes(data.controllerAction);
  const map = window.mapboxMap as Map;
  const [rideWithURL, setRideWithURL] = useState<null | string>(null);
  const [route, _setRoute] = useState<Route>(null);
  const routeRef = useRef(route);
  const setRoute = (newRoute: Route) => {
    routeRef.current = newRoute;
    _setRoute(newRoute);
  };
  const [importType, setImportType] = useState('gpx');
  const [distance, setDistance] = useState(0);
  const [previousTool, setPreviousTool] = useState('point');
  const [tool, toolRef, setTool] = useStateRef('no-tools');
  const [popups, popupsRef, setPopups] = useStateRef([]);
  const [popupPos, setPopupPos] = useState<null | LngLat>(null);
  const [directionsType, directionsTypeRef, setDirectionsType] = useStateRef('walking');
  const [elevationChange, setElevationChange] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showRideWithModal, setShowRideWithModal] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [loaderText, setLoaderText] = useState<null | string>(null);
  const [startTime, setStartTime] = useState<null | string>(null);
  const draggingPointIndex = useRef<null | number>(null);
  const draggingControlPoint = useRef(false);
  const hoveringOverMarkerRef = useRef(false);
  const [flickrPhotos, setFlickrPhotos] = useState<string[]>([]);
  const [wikiData, setWikiData] = useState<[string, string][]>([]);
  const [weather, setWeather] = useState<Weather>([]);
  const [mountain, setMountain] = useState<Mountain>();
  const [pathModalData, setPathModalData] = useState<PathModalData>();

  const [isMobile, setIsMobile] = useState(window.innerWidth > 1000 ? false : true);
  const [elevationDistanceDisplay, setElevationDistanceDisplay] = useState<null | {
    distance: number;
    elevation: number;
    x: number;
    y: number;
  }>(null);

  const setRouteFromScratch = (route: Route) => {
    setRoute(route);
    const lngLat = new LngLat(route[0].lng, route[0].lat);
    const zoom = window.mapboxMap.getZoom();
    window.mapboxMap.flyTo({
      center: lngLat,
      essential: true,
      zoom: zoom < 9 ? 9 : zoom,
    });
    addMarker(moveStartMarker(lngLat));
  };

  useEffect(() => {
    console.log(weather);
  }, [weather]);

  const contextValues = {
    route,
    setRoute,
    routeRef,
    setRouteFromScratch,
    tool,
    toolRef,
    setTool,
    description,
    setDescription,
    title,
    setTitle,
    startTime,
    setStartTime,
    popups,
    setPopups,
    setPopupPos,
    popupsRef,
    hoveringOverMarkerRef,
    directionsType,
    directionsTypeRef,
    setDirectionsType,
    draggingPointIndex,
    draggingControlPoint,
    setElevationDistanceDisplay,
    isEditor,
    setShowForm,
    setShowRideWithModal,
    setDistance,
    setElevationChange,
    setLoaderText,
  };

  useRouteUpdate(route, setDistance, setElevationChange, routeHistory);
  useMapSize({ height: 'calc(80vh - 64px)' });
  useLayers(tool, setMountain, setLoaderText, setPathModalData);

  useEffect(() => {
    if (ctx.controllerData.controllerAction !== 'rides#show') return;
    const onResize = () => {
      if (window.innerWidth < 1000) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const setCursor = (type: string) => {
      map.getCanvas().style.cursor = type;
      window.currentCursor = type;
    };
    switch (tool) {
      case 'google': {
        setCursor(`url(${streetViewCursor}) 16 32, auto`);
        break;
      }
      case 'flickr': {
        setCursor(`url(${cameraCursor}) 16 16, auto`);
        break;
      }
      case 'info': {
        setCursor(`url(${infoCursor}) 16 16, auto`);
        break;
      }
      case 'pop-up': {
        setCursor(`url(${pinPointCursor}) 16 32, auto`);
        break;
      }
      case 'cp': {
        setCursor(`url(${controlPointCursor}) 16 16, auto`);
        break;
      }
      case 'point': {
        setCursor(`url(${crossHairCursor}) 16 16, auto`);
        break;
      }
      case 'line': {
        setCursor(`url(${crossHairCursor}) 16 16, auto`);
        break;
      }
      case 'weather': {
        setCursor(`url(${weatherCursor}) 16 16, auto`);
        break;
      }
      default: {
        setCursor('initial');
      }
    }
  }, [tool]);
  return (
    <RideContext.Provider value={contextValues}>
      {loaderText && <Loader loaderText={loaderText} setLoaderText={setLoaderText} />}
      <UseMapInitialization />
      <UseMapListenerInitialization />
      {isEditor && (
        <>
          <UseControlPoints />
          <UseLocalStorage />
        </>
      )}

      <UsePopups />
      {isEditor && <UseFixMissingElevations />}
      <div className='RideNew'>
        {popupPos && (
          <Modal onClose={() => setPopupPos(null)}>
            <MapPopUpEditor popupPos={popupPos} setPopupPos={setPopupPos} popups={popups} setPopups={setPopups} />
          </Modal>
        )}
        {flickrPhotos.length ? (
          <Modal onClose={() => setFlickrPhotos([])}>
            <FlickrModal flickrPhotos={flickrPhotos} />
          </Modal>
        ) : (
          <></>
        )}
        {wikiData.length ? (
          <Modal onClose={() => setWikiData([])}>
            <WikiModal wikiData={wikiData} />
          </Modal>
        ) : (
          <></>
        )}
        {weather.length ? (
          <Modal onClose={() => setWeather([])}>
            <WeatherModal weather={weather} />
          </Modal>
        ) : (
          <></>
        )}
        {mountain ? (
          <Modal onClose={() => setMountain(undefined)}>
            <MountainModal mountain={mountain} />
          </Modal>
        ) : (
          <></>
        )}
        {pathModalData ? (
          <Modal onClose={() => setPathModalData(undefined)}>
            <PathModal path={pathModalData} />
          </Modal>
        ) : (
          <></>
        )}
        {isEditor && showRideWithModal && (
          <Modal onClose={() => setShowRideWithModal(false)}>
            <div className='standard-modal'>
              <select onChange={(e) => setImportType(e.target.value)} defaultValue={importType}>
                <option value='gpx'>Import GPX File</option>
                <option value='kml'>Import KML File</option>
                {/* <option value='rwgps'>Import from Ride With GPS</option>  DOESNT WORK ANYMORE?? */}
              </select>
              {(importType === 'gpx' || importType === 'kml') && (
                <button
                  onClick={() => {
                    console.log(importType);
                    openFile(
                      (fileList) => {
                        fileList[0].text().then((text) => {
                          const route = importer(importType, text);
                          if (!route) return alert('There was an error importing your file.');
                          setRouteFromScratch(route);
                          setShowRideWithModal(false);
                        });
                      },
                      false,
                      `.${importType}`
                    );
                  }}>
                  Choose File
                </button>
              )}
            </div>
          </Modal>
        )}
        {showForm && <MapForm setShowForm={setShowForm} />}
        <MapTools setPreviousTool={setPreviousTool} undoHistory={undoHistory} routeHistory={routeHistory} />
        {elevationDistanceDisplay && !window.isTouchScreen && (
          <ElevationDistanceDisplayer data={elevationDistanceDisplay} />
        )}
        <div className='map-show-container' style={{ position: 'relative', display: 'flex', width: '100%' }}>
          {!isMobile && ctx.controllerData?.ride?.isEvent && ctx.controllerData.controllerAction === 'rides#show' && (
            <EventShow />
          )}
          <div className='map-container' style={{ position: 'relative', width: '100%' }}>
            <MapboxMap
              tool={tool}
              onClick={getClickFunc(
                tool,
                route,
                setRoute,
                directionsType,
                setFlickrPhotos,
                setLoaderText,
                draggingControlPoint,
                setWikiData,
                setWeather
              )}
            />
            <div className='map-top-tools'>
              {window.isProbablyDesktop && <Controls3D map={map} />}
              <div>
                <select
                  title='Select Map Style'
                  style={{ pointerEvents: 'all' }}
                  onChange={(e) => {
                    map.setStyle(e.target.value);

                    map.once('style.load', () => {
                      addLayersAndSources();
                      if (route?.length) setRoute([...route]);
                    });
                  }}>
                  <option value={window.baseMapURL}>Streets</option>
                  <option value='mapbox://styles/mapbox/satellite-streets-v11'>Satellite Streets</option>
                  <option value='mapbox://styles/mapbox/satellite-v9'>Satellite</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <ElevationProfile route={route} hoveringPoint={elevationDistanceDisplay} />
        {isMobile && ctx.controllerData?.ride?.isEvent && ctx.controllerData.controllerAction === 'rides#show' && (
          <EventShow />
        )}
      </div>
    </RideContext.Provider>
  );
};

export default Ride;
