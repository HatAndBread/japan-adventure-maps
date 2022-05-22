import { LngLat, Map, MercatorCoordinate } from "mapbox-gl";
import React, { useEffect, useState, useMemo, useRef } from "react";
import MapboxMap from "../Components/Map/MapboxMap";
import { useMapSize } from "../Hooks/useMapSize";
import { useAppContext } from "../Context";
import { Route } from "../../lib/map-logic";
import along from "@turf/along";
import { lineString } from "@turf/helpers";
import length from "@turf/length";
import bearing from "@turf/bearing";
import rhumbDestination from "@turf/rhumb-destination";
import { point } from "@turf/helpers";

const ThreeD = () => {
  const data = useAppContext().controllerData;
  const [mapIdle, setMapIdle] = useState(false);
  const originalRoute = useMemo<Route>(() => {
    return JSON.parse(data.ride.route);
  }, []);

  const route = useMemo<Route>(() => {
    return originalRoute
      .map((r, i) =>
        !(i % (originalRoute.length >= 180 ? 60 : 20)) ? r : null
      )
      .filter((r) => r);
  }, []);
  const started = useRef(false);

  const map = window.mapboxMap as Map;
  useMapSize({ height: "calc(100vh - 40px)" });
  useEffect(() => {
    map.setStyle("mapbox://styles/mapbox/satellite-v9");
    window.stop3D = undefined;
    setTimeout(()=>{
      setMapIdle(true);
    }, 2000)
  }, []);

  useEffect(() => {
    if (!route) return;
    if (started.current) return;
    started.current = true;
    const elevations = route.map((r) => Math.round(r.e));
    const highestElevation = elevations.reduce((prev, curr) =>
      prev > curr ? prev : curr
    );
    const animate = () => {
      const cameraRouteDistance = length(lineString(cameraRoute));
      const cameraAltitude = highestElevation + 6000;
      let start;
      function frame(time) {
        if (!start) start = time;
        // phase determines how far through the animation we are
        const phase = (time - start) / animationDuration;

        // phase is normalized between 0 and 1
        // when the animation is finished, reset start to loop the animation
        if (phase > 1) {
          // wait 1.5 seconds before looping
          setTimeout(() => {
            start = 0.0;
          }, 1500);
        }
        // use the phase to get a point that is the appropriate distance along the route
        // this approach syncs the camera and route positions ensuring they move
        // at roughly equal rates even if they don't contain the same number of points
        const alongRoute = along(lineString(targetRoute), routeDistance * phase)
          .geometry.coordinates;

        const alongCamera = along(
          lineString(cameraRoute),
          cameraRouteDistance * phase
        ).geometry.coordinates;

        const camera = map.getFreeCameraOptions();

        // set the position and altitude of the camera
        camera.position = MercatorCoordinate.fromLngLat(
          {
            lng: alongCamera[0],
            lat: alongCamera[1],
          },
          cameraAltitude
        );

        // tell the camera to look at a point along the route
        camera.lookAtPoint({
          lng: alongRoute[0],
          lat: alongRoute[1],
        });

        map.setFreeCameraOptions(camera);

        if (!window.stop3D) {
          window.requestAnimationFrame(frame);
        } else {
          window.stop3D = undefined;
        }
      }

      window.requestAnimationFrame(frame);
    };

    const beginAnimate = () => {
      map.addSource("trace", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: originalRoute.map((r) => [r.lng, r.lat]),
          },
        },
      });
      map.addLayer({
        type: "line",
        source: "trace",
        id: "trace",
        paint: {
          "line-color": "rgba(250,50,50,0.7)",
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
      map.once('idle', animate)
    };
    if (!route?.length) return;

    const targetRoute = route.map((r) => [r.lng, r.lat]);
    const routeDistance = length(lineString(targetRoute));
    const animationDuration = routeDistance * 6000;
    const getCameraRoute = () => {
      try {
        return route.map((r, i) => {
          const next = route[i + 1] || route[i];
          const currPoint = point([r.lng, r.lat]);
          const nextPoint = point([next.lng, next.lat]);
          const b = bearing(nextPoint, currPoint);
          return rhumbDestination(currPoint, 15, b).geometry.coordinates;
        });
      } catch {
        return route.map((r) => [r.lng - 0.03, r.lat]);
      }
    };
    const cameraRoute = getCameraRoute();
    map.jumpTo({ center: new LngLat(route[0].lng, route[0].lat), zoom: 15 });
    map.once('idle', beginAnimate)
  }, [route, mapIdle]);
  return (
    <div className="ThreeD">
      <a
        href={`/rides/${data.ride.id}`}
        style={{
          position: "absolute",
          backgroundColor: "white",
          borderRadius: "6px",
          left: "8px",
          width: "30px",
          height: "30px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <i className="fas fa-arrow-alt-circle-left big-icon"></i>
        </div>
      </a>
      <MapboxMap />
    </div>
  );
};

export default ThreeD;
