import React, { useEffect, useState, useRef } from "react";
import MapboxMap from "../Components/Map/MapboxMap";
import { LngLat, Map } from "mapbox-gl";
import { useAppContext } from "../Context";
import { Ride } from "../Types/Models";
import Modal from "../Components/Modal/Modal";
import { useMapSize } from "../Hooks/useMapSize";
import { MapLayerMouseEvent } from "mapbox-gl";
import hike from "../../../assets/images/hike.png";
import bike from "../../../assets/images/ride.png";
import {slideshow} from '../../lib/slideshow';
import LikesCount from '../Components/LikesCount';
import { MapEventListenerAdder } from "../../lib/map-logic";

const FindRide = () => {
  const map = window.mapboxMap as Map;
  const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;

  const { allRides } = useAppContext();
  const [rides, setRides] = useState<Ride[]>([]);
  const [hikes, setHikes] = useState<Ride[]>([]);
  const [rideModalContent, setRideModalContent] = useState<null | Ride>(null);
  const [showCycling, setShowCycling] = useState(true);
  const [showHiking, setShowHiking] = useState(true);


  const mouseEnter = useRef(() => {
    map.getCanvas().style.cursor = "pointer";
  });
  const mouseLeave = useRef(() => {
    map.getCanvas().style.cursor = window.currentCursor || "default";
  });
  const onRideClick = useRef((e: MapLayerMouseEvent) => {
    const props = e.features[0].properties;
    setRideModalContent(props as Ride)
    slideshow();
  });

  const iconsLoaded = useRef(0);
  useMapSize({ height: "calc(100vh - 40px)" });
  useEffect(() => {
    setRides(allRides.filter((r) => r.rideType === "cycling").sort((a, b) => b.likesCount - a.likesCount));
    setHikes(allRides.filter((r) => r.rideType === "hiking").sort((a, b) => b.likesCount - a.likesCount ));
  }, [allRides]);

  const parseImages = (string: string) => {
    try {
      return JSON.parse(string);
    } catch {
      return [];
    }
  };
  useEffect(()=>{
    window.currentCursor = 'default'
    map.getCanvas().style.cursor = window.currentCursor;
  })

  useEffect(()=>{
    if (!map.getLayer('all-hikes-layer')) return;
    if (!showHiking) {
      map.setLayoutProperty('all-hikes-layer', 'visibility', 'none')
    }else {
      map.setLayoutProperty('all-hikes-layer', 'visibility', 'visible')
    }
  }, [showHiking])

  useEffect(()=>{
    if (!map.getLayer('all-rides-layer')) return;
    if (!showCycling){ 
      map.setLayoutProperty('all-rides-layer', 'visibility', 'none');
    } else {
      map.setLayoutProperty('all-rides-layer', 'visibility', 'visible')
    }
  }, [showCycling])

  useEffect(() => {
    if (!rides.length) return;
    if (!hikes.length) return;
    if (map.getSource("all-rides") || map.getLayer("all-rides-layer")) return;
    if (map.getSource("all-hikes") || map.getLayer("all-hikes-layer")) return;

    const loadSources = () => {
      [rides, hikes].forEach((x, i) => {
        const type = i ? "hikes" : "rides";
        const rideData = {
          type: "FeatureCollection",
          features: x.map((r) => {
            return {
              type: "Feature",
              properties: {
                id: r.id,
                likesCount: r.likesCount,
                description: r.description,
                title: r.title,
                maxElevation: r.maxElevation,
                elevationGain: r.elevationGain,
                rideType: r.rideType,
                featuredImages: r.featuredImages,
                distance: r.distance,
                startLocationJp: r.startLocationJp,
                startLocationEn: r.startLocationEn,
              },
              geometry: {
                type: "Point",
                coordinates: [r.startLng, r.startLat],
              },
            };
          }),
        };
        map.addSource(`all-${type}`, {
          type: "geojson",
          // @ts-ignore
          data: rideData,
        });
        map.addLayer({
          id: `all-${type}-layer`,
          type: "symbol",
          source: `all-${type}`,
          layout: {
            "icon-image": type === "hikes" ? hike : bike,
            "icon-size": 0.5,
            "icon-allow-overlap": false,
          },
        });
        mapEventListenerAdder.onWithLayer({type: "mouseenter", layerName: `all-${type}-layer`, listener: mouseEnter.current});
        mapEventListenerAdder.onWithLayer({type: "mouseleave", layerName: `all-${type}-layer`, listener: mouseLeave.current});
        mapEventListenerAdder.onWithLayer({type: "click", layerName: `all-${type}-layer`, listener: onRideClick.current});
      });
    };
    if (map.hasImage(hike) && map.hasImage(bike)) {
      loadSources();
    } else {
      [hike, bike].forEach((url) => {
        if (!map.hasImage(url)) {
          map.loadImage(url, (_, image) => {
            map.addImage(url, image);
            iconsLoaded.current += 1;
            if (iconsLoaded.current === 2) loadSources();
          });
        }
      });
    }
    return () => {
      console.log('HOOP')
      ['rides', 'hikes'].forEach((type) => {
        mapEventListenerAdder.off({type: "mouseenter", layerName: `all-${type}-layer`, listener: mouseEnter.current});
        mapEventListenerAdder.off({type: "mouseleave", layerName: `all-${type}-layer`, listener: mouseLeave.current});
        mapEventListenerAdder.off({type: "click", layerName: `all-${type}-layer`, listener: onRideClick.current});
      });
    }
  }, [rides, hikes]);

  useEffect(() => {
    // Clean up after navigation
    const l = () => {
      ["all-rides", "all-hikes"].forEach((source) => {
        if (map.getLayer(`${source}-layer`)) {
          map.removeLayer(`${source}-layer`);
          map.removeSource(source);
        }
      });
      mapEventListenerAdder.off({type: "mouseenter", layerName: `all-hikes-layer`, listener: mouseEnter.current});
      mapEventListenerAdder.off({type: "mouseleave", layerName: `all-hikes-layer`, listener: mouseLeave.current});
      mapEventListenerAdder.off({type: "click", layerName: `all-hikes-layer`, listener: onRideClick.current});
      mapEventListenerAdder.off({type: "mouseenter", layerName: `all-rides-layer`, listener: mouseEnter.current});
      mapEventListenerAdder.off({type: "mouseleave", layerName: `all-rides-layer`,listener: mouseLeave.current});
      mapEventListenerAdder.off({type: "click", layerName: `all-rides-layer`, listener: onRideClick.current});
      document.removeEventListener("turbo:before-fetch-request", l);
      window.removeEventListener("popstate", l);
    };

    document.addEventListener("turbo:before-fetch-response", l);
    window.addEventListener("popstate", l);
  }, []);

  return (
    <div className="FindRide">
      <div className="ride-filter">
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="cycling-checkbox">Show Cycling Routes</label>
          <input
            type="checkbox"
            id="cycling-checkbox"
            checked={showCycling}
            onChange={() => setShowCycling(!showCycling)}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="cycling-checkbox">Show Hiking Routes</label>
          <input
            type="checkbox"
            id="hiking-checkbox"
            checked={showHiking}
            onChange={() => setShowHiking(!showHiking)}
          />
        </div>
      </div>
      {rideModalContent && (
        <Modal onClose={() => setRideModalContent(null)}>
          <div className="find-ride-modal">
              <LikesCount likesCount={rideModalContent.likesCount} />
            <h1>
              {rideModalContent.title}
            </h1>
            <h4>
              A {rideModalContent.rideType} route in {rideModalContent.startLocationEn || 'a secret location'}
            </h4>
            <p style={{ marginBottom: "8px" }}>
              {rideModalContent.description}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <a
                className="link-button"
                href={`/rides/${rideModalContent.id}`}
                style={{ width: "100%", maxWidth: "224px", margin: "8px" }}
              >
                View Route
              </a>
              <a
                className="link-button"
                href={`/rides/${rideModalContent.id}/three_d`}
                style={{ width: "100%", maxWidth: "224px", margin: "8px" }}
              >
                3D Tour
              </a>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ul style={{ marginTop: "8px" }}>
                <li>
                  <strong>Type: </strong>
                  {rideModalContent.rideType}&nbsp;
                  {rideModalContent.rideType === "hiking" ? (
                    <i className="fas fa-hiking fa-lg"></i>
                  ) : (
                    <i className="fas fa-bicycle fa-lg"></i>
                  )}
                </li>
                <li>
                  <strong>Distance: </strong>
                  {Math.round(rideModalContent.distance)} km
                </li>
                <li>
                  <strong>Max Elevation: </strong>
                  {rideModalContent.maxElevation} m
                </li>
                <li>
                  <strong>Total Elevation Gain: </strong>
                  {rideModalContent.elevationGain} m
                </li>
              </ul>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                className="slideshow"
                data-urls={rideModalContent.featuredImages}
              >
                <div className="slideshow-image">
                  {parseImages(rideModalContent.featuredImages).length > 1 && (
                    <>
                      <i className="fas fa-chevron-left fa-lg"></i>
                      <i className="fas fa-chevron-right fa-lg"></i>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <MapboxMap />
    </div>
  );
};

export default FindRide;
