import React, { useEffect } from "react";
import { useMapSize } from "../Hooks/useMapSize";
import { Map, LngLat } from "mapbox-gl";
import MapboxMap from "../Components/Map/MapboxMap";
import { addLayersAndSources } from "../../application-esbuild.js";
import Controls3D from "../Components/MapTools/3DControls";

const ThreeDDemo = () => {
  const map = window.mapboxMap as Map;
  useMapSize({ height: "calc(100vh - 40px)" });
  useEffect(() => {
    map.jumpTo({ center: new LngLat(138.7262, 35.3606) });
    map.setZoom(12.5);
    map.setPitch(80);
    if (map.getSource('mapbox-dem')) {
      map.setTerrain();
      map.removeSource('mapbox-dem');
    }
    map.setStyle("mapbox://styles/mapbox/satellite-v9");
    map.once('idle', addLayersAndSources)
    // addLayersAndSources();
    // if (map.isStyleLoaded()){
      // map.setStyle("mapbox://styles/mapbox/satellite-v9");
      // addLayersAndSources();
    // } else {
      // map.once("styledata", () => {
        // map.setStyle("mapbox://styles/mapbox/satellite-v9");
        // addLayersAndSources();
      // });
    // }
  }, []);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "16px",
          width: "fit-content",
          zIndex: 1,
        }}
      >
        <Controls3D map={map} />
      </div>
      <MapboxMap />
    </>
  );
};

export default ThreeDDemo;
