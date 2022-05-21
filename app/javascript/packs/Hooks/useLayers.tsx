import React, { useEffect, useRef } from "react";
import { Map, MapLayerMouseEvent, MapMouseEvent, Popup, LngLat } from "mapbox-gl";
import { getElevation } from "../../lib/map-logic";
import { Mountain, Cave, Waterfall, Bed, Hut, Camp, PathModalData, TrackModalData } from "../Types/Models";
import { MapEventListenerAdder } from '../../lib/map-logic';

const useLayers = (
  tool: string,
  setMountain: React.Dispatch<React.SetStateAction<Mountain>>,
  setCave: React.Dispatch<React.SetStateAction<Cave>>,
  setBed: React.Dispatch<React.SetStateAction<Bed>>,
  setHut: React.Dispatch<React.SetStateAction<Hut>>,
  setCamp: React.Dispatch<React.SetStateAction<Camp>>,
  setWaterfall: React.Dispatch<React.SetStateAction<Waterfall>>,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>,
  setPathModalData: React.Dispatch<React.SetStateAction<{name: string}>>,
  setTrackModalData: React.Dispatch<React.SetStateAction<TrackModalData>>,
) => {
  const customLayers = [
    "peaks",
    "huts",
    "camps",
    "beds",
    "tracks",
    "caves",
    "waterfalls",
  ];
  const map = window.mapboxMap as Map;
  useEffect(() => {
    const clickFuncs = {
      peaks: async (props: { [name: string]: any}, lngLat: LngLat) => {
        const wikiurls = await (async () => {
          if (!props.wikipedia) return;
          setLoaderText("Getting mountain data...");
          const lang = props.wikipedia.slice(0, 2);
          const nameEn = props["name:en"];
          if (lang === "ja" && !nameEn) {
            return [
              `https://ja.wikipedia.org/wiki/${props.wikipedia.slice(3)}`,
            ];
          }
          if (lang === "ja" && nameEn) {
            let url = "https://en.wikipedia.org/w/api.php?origin=*";

            const params = {
              action: "query",
              list: "geosearch",
              gscoord: `${lngLat.lat}|${lngLat.lng}`,
              gsradius: "10000",
              gslimit: "10",
              format: "json",
            };

            Object.keys(params).forEach(function (key) {
              url += "&" + key + "=" + params[key];
            });
            const result = await fetch(url);
            const data = await result.json();
            const pageId = data?.query?.geosearch?.filter((item) => {
              const title = item?.title
                ?.toLowerCase()
                ?.normalize("NFD")
                ?.replace(/[\u0300-\u036f]/g, "")
                ?.replace("mt.", "mount");
              if (!title) return;
              const nameEn = props["name:en"]
                ?.toLowerCase()
                ?.normalize("NFD")
                ?.replace(/[\u0300-\u036f]/g, "")
                .replace("mt.", "mount");
              const name = props.name
                ?.toLowerCase()
                ?.normalize("NFD")
                ?.replace(/[\u0300-\u036f]/g, "")
                .replace("mt.", "mount");
              return title === nameEn || title === name;
            })[0]?.pageid;
            const englishUrl = pageId
              ? `https://en.wikipedia.org/?curid=${pageId}`
              : null;
            return [
              `https://ja.wikipedia.org/wiki/${props.wikipedia.slice(3)}`,
              englishUrl,
            ];
          }
          if (lang === "en") {
            return [
              `https://ja.wikipedia.org/wiki/${props.name}`,
              `https://en.wikipedia.org/wiki/${props.wikipedia.slice(3)}`,
            ];
          }
        })();
        let thumbnailURL =
          props.wikipedia &&
          `https://${props.wikipedia.slice(
            0,
            2
          )}.wikipedia.org/w/api.php?action=query&titles=${props.wikipedia.slice(
            3
          )}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
        if (thumbnailURL) {
          const res = await fetch(thumbnailURL);
          const data = await res.json();
          if (data.query?.pages) {
            thumbnailURL =
              data.query.pages[Object.keys(data.query.pages)[0]]?.thumbnail
                ?.source;
          }
        }
        setLoaderText("");
        setMountain({
          elevation: props.ele || getElevation(lngLat) || ("?" as string),
          imageURL: thumbnailURL,
          wikiurls,
          name: `${props.name || ""} ${
            props["name:en"] ? `(${props["name:en"]})` : ""
          }`,
          prominence: props.prominence,
        });
      },
      huts: (props: { [name: string]: any}, lngLat: LngLat) => {
        setHut({url: props.website, name: props.name, nameEn: props["name:en"]})
      },
      camps: (props: { [name: string]: any}, lngLat: LngLat) => {
        setCamp({url: props.website, name: props.name})
      },
      beds: (props: { [name: string]: any}, lngLat: LngLat) => {
        const getType = (str: string) => {
          if (str === "guest_house") return "Guest House";
          if (str === "hostel") return "Hostel";
          if (str === "motel") return "Motel";
          return "Hotel";
        };
        setBed({url: props.website, name: props.name, type: getType(props.tourism)})
      },
      waterfalls: async (props: { [name: string]: any}, lngLat: LngLat) => {
        const wikipediaUrl =
          props.wikipedia &&
          `https://${props.wikipedia.slice(
            0,
            2
          )}.wikipedia.org/wiki/${props.wikipedia.slice(3)}`;
        let thumbnailURL =
          props.wikipedia &&
          `https://${props.wikipedia.slice(
            0,
            2
          )}.wikipedia.org/w/api.php?action=query&titles=${props.wikipedia.slice(
            3
          )}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
        if (thumbnailURL) {
          const res = await fetch(thumbnailURL);
          const data = await res.json();
          if (data.query?.pages) {
            thumbnailURL =
              data.query.pages[Object.keys(data.query.pages)[0]]?.thumbnail
                ?.source;
          }
        }
        setWaterfall({name: props.name, wikiurls: [wikipediaUrl], imageURL: thumbnailURL});
      },
      caves: async (props: { [name: string]: any}, lngLat: LngLat) => {
        const wikipediaUrl =
          props.wikipedia &&
          `https://${props.wikipedia.slice(
            0,
            2
          )}.wikipedia.org/wiki/${props.wikipedia.slice(3)}`;
        let thumbnailURL =
          props.wikipedia &&
          `https://${props.wikipedia.slice(
            0,
            2
          )}.wikipedia.org/w/api.php?action=query&titles=${props.wikipedia.slice(
            3
          )}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
        if (thumbnailURL) {
          setLoaderText("Gathering cave data...");
          const res = await fetch(thumbnailURL);
          const data = await res.json();
          if (data.query?.pages) {
            thumbnailURL =
              data.query.pages[Object.keys(data.query.pages)[0]]?.thumbnail
                ?.source;
          }
          setLoaderText("");
        }
        setCave({name: props.name, wikiurls: [wikipediaUrl], imageURL: thumbnailURL})
      },
      tracks: async (props: { [name: string]: any}, lngLat: LngLat) => {

        let url =
          props.name &&
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${props.name}&type=video&key=${process.env.GOOGLE_KEY}`;
        if (url) {
          setLoaderText("Gathering road data...");
          const res = await fetch(url);
          const data = await res.json();
          url = `https://youtube.com/embed/${
            data.items[Math.floor(Math.random() * data.items.length)]?.id
              ?.videoId
          }`;
          setLoaderText("");
        }
        setTrackModalData({url, name: props.name})
      },
    };
    const mouseEnter = () => {
      if (tool === 'no-tools') map.getCanvas().style.cursor = "pointer";
    };
    const mouseLeave = (e: MapLayerMouseEvent) => {
      if (tool !== 'no-tools') return;
      const features = map
        .queryRenderedFeatures(e.point)
        .map((f) => f?.layer?.id);
      const overlaps = customLayers.filter((l) => features.includes(l));
      if (!overlaps.length)
        map.getCanvas().style.cursor = window.currentCursor || "initial";
    };
    const theClickFunction = (e: MapMouseEvent) => {
      if (tool !== "no-tools") return;
      const features = map.queryRenderedFeatures(e.point);
      const relevantLayers = features.filter((f) => Object.keys(clickFuncs).includes(f.layer.id));
      if (!relevantLayers.length) return;
      const layerId = relevantLayers[0].layer.id;
      if (typeof clickFuncs[layerId] === 'function') clickFuncs[layerId](relevantLayers[0].properties, e.lngLat);
      e.preventDefault();
      e.originalEvent.stopPropagation();
    };
    const mapEventListenerAdder = window.mapEventListenerAdder as MapEventListenerAdder;
    mapEventListenerAdder.on({type: 'click', listener: theClickFunction}) 
    customLayers.forEach((layer) => {
      mapEventListenerAdder.onWithLayer({type: 'mouseenter', layerName: layer, listener: mouseEnter})
      mapEventListenerAdder.onWithLayer({type: 'mouseleave', layerName: layer, listener: mouseLeave})
    });

    return () => {
      customLayers.forEach((layer: string) => {
        // map.off('mouseenter', layer, mouseEnter);
        // map.off('mouseleave', layer, mouseLeave);
        mapEventListenerAdder.off({type: "mouseenter", layerName: layer, listener: mouseEnter });
        mapEventListenerAdder.off({type: "mouseleave", layerName: layer, listener: mouseLeave });
      });
      // map.off('click', theClickFunction);
      mapEventListenerAdder.off({type: "click", listener: theClickFunction});
    };
  }, [tool]);
};

export default useLayers;
