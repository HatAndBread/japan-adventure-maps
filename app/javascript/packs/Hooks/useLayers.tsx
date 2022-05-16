import React, { useEffect, useRef } from "react";
import { Map, MapLayerMouseEvent, MapMouseEvent, Popup, LngLat } from "mapbox-gl";
import { getElevation } from "../../lib/map-logic";
import { Mountain, Cave, PathModalData } from "../Types/Models";
import { renderToString } from "react-dom/server";
import { MapEventListenerAdder } from '../../lib/map-logic';

const useLayers = (
  tool: string,
  setMountain: React.Dispatch<React.SetStateAction<Mountain>>,
  setCave: React.Dispatch<React.SetStateAction<Cave>>,
  setLoaderText: React.Dispatch<React.SetStateAction<string>>,
  setPathModalData: React.Dispatch<
    React.SetStateAction<{
      name: string;
    }>
  >
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
    if (tool !== "no-tools") return;
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
        console.log(props);
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>
                  {props.name} {props["name:en"] && `(${props["name:en"]})`}
                </h1>
                {props.website && (
                  <a href={props.website} target="_blank">
                    Website
                  </a>
                )}
              </div>
            )
          )
          .addTo(map);
      },
      camps: (props: { [name: string]: any}, lngLat: LngLat) => {
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>{props.name}</h1>
                {props.website && (
                  <a href={props.website} target="_blank">
                    Website
                  </a>
                )}
              </div>
            )
          )
          .addTo(map);
      },
      toilets: (props: { [name: string]: any}, lngLat: LngLat) => {
        console.log(props);
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>{props.name}</h1>
                {props.website && (
                  <a href={props.website} target="_blank">
                    Website
                  </a>
                )}
              </div>
            )
          )
          .addTo(map);
      },
      beds: (props: { [name: string]: any}, lngLat: LngLat) => {
        const getType = (str: string) => {
          if (str === "hotel") return "Hotel";
          if (str === "guest_house") return "Guest House";
          if (str === "hostel") return "Hostel";
          if (str === "motel") return "Motel";
          return "Hotel";
        };
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>{props.name}</h1>
                <p>Type: {getType(props.tourism)}</p>
                {props.website && (
                  <a href={props.website} target="_blank">
                    Website
                  </a>
                )}
              </div>
            )
          )
          .addTo(map);
      },
      "transit-label": (props: { [name: string]: any}, lngLat: LngLat) => {
        console.log(props);
      },
      paths: (props: { [name: string]: any}, lngLat: LngLat) => {
        setPathModalData(props as PathModalData);
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
        console.log(props);
        if (thumbnailURL) {
          const res = await fetch(thumbnailURL);
          const data = await res.json();
          if (data.query?.pages) {
            thumbnailURL =
              data.query.pages[Object.keys(data.query.pages)[0]]?.thumbnail
                ?.source;
          }
        }
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>
                  {props.name} {props["name-en"] && ` (${props["name-en"]})`}
                </h1>
                {thumbnailURL && (
                  <div>
                    <img src={thumbnailURL}></img>
                  </div>
                )}
                {wikipediaUrl && (
                  <div>
                    <a href={wikipediaUrl} target="_blank">
                      Wikipedia
                    </a>
                  </div>
                )}
              </div>
            )
          )
          .addTo(map);
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
          console.log(data);
          url = `https://youtube.com/embed/${
            data.items[Math.floor(Math.random() * data.items.length)]?.id
              ?.videoId
          }`;
          setLoaderText("");
        }
        console.log(url);
        new Popup()
          .setLngLat(lngLat)
          .setHTML(
            renderToString(
              <div>
                <h1>{props.name || "Unnamed forest / farm road"}</h1>
                {url && (
                  <iframe
                    width="300"
                    src={url}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            )
          )
          .addTo(map);
      },
    };
    const mouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const mouseLeave = (e: MapLayerMouseEvent) => {
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
        mapEventListenerAdder.off({type: "mouseenter", layerName: layer, listener: mouseEnter });
        mapEventListenerAdder.off({type: "mouseleave", layerName: layer, listener: mouseLeave });
      });
      mapEventListenerAdder.off({type: "click", listener: theClickFunction});
    };
  }, [tool]);
};

export default useLayers;
