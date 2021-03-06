import React, { useState, useEffect, useRef } from "react";
import { MapMouseEvent, Map } from "mapbox-gl";
import { MapEventListenerAdder } from "../../../lib/map-logic";
import { useResetPitchAndBearing } from "../../Hooks/useResetPitchAndBearing";
import { useAppContext } from "../../Context";
import {addLayersAndSources} from '../../../application-esbuild.js';

const MapboxMap = ({
  onClick,
  tool,
}: {
  onClick?: (e: MapMouseEvent) => any;
  tool?: string;
}) => {
  const lastFunc = useRef<(arg0: any) => any>();
  const mapEventListenerAdder =
    window.mapEventListenerAdder as MapEventListenerAdder;
  const [mapInitialized, setMapInitialized] = useState(false);
  const ref = useRef<HTMLDivElement>();
  const map = window.mapboxMap as Map;
  const { controllerData } = useAppContext();
  useResetPitchAndBearing();
  useEffect(() => {
    if (!mapInitialized) return;
    const shouldNotShowHeatmap = () =>
      map.getLayer("heatmap-hiking-layer") &&
      !["rides#show", "rides#edit", "rides#new"].includes(
        controllerData.controllerAction
      );
    const shouldNotShowCyclingHeatmap = () =>
      map.getLayer("heatmap-cycling-layer") &&
      !["rides#show", "rides#edit", "rides#new"].includes(
        controllerData.controllerAction
      );
    if (shouldNotShowHeatmap())
      map.setLayoutProperty("heatmap-hiking-layer", "visibility", "none");
    if (shouldNotShowCyclingHeatmap())
      map.setLayoutProperty("heatmap-cycling-layer", "visibility", "none");
    if (["rides#find_a_ride"].includes(controllerData.controllerAction)) {
      if (map.getStyle().name !== "Pedal Party Japan") {
        map.setStyle(window.baseMapURL);
        map.once('idle', addLayersAndSources);
      }
    }
  }, [mapInitialized]);
  useEffect(() => {
    if (ref.current) {
      const container = window.mapboxContainer;
      if (!mapInitialized) {
        if (lastFunc.current)
          mapEventListenerAdder.off({
            type: "click",
            listener: lastFunc.current,
          });
        lastFunc.current = onClick;
        setMapInitialized(true);
        ref.current.appendChild(container);
        map.resize();
        onClick &&
          mapEventListenerAdder.on({
            type: "click",
            listener: lastFunc.current,
          });
      }
      return () => {
        if (mapInitialized) {
          setMapInitialized(false);
        }
      };
    }
  }, [onClick, mapInitialized, tool, ref]);
  return <div className="map-wrapper" ref={ref}></div>;
};

export default MapboxMap;
