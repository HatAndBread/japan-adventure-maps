type Bbox = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};
type OverpassData = {
  elements: {
    type: string;
    id: number;
    bounds: {
      minlat: number;
      minlon: number;
      maxlat: number;
      maxlon: number;
    };
    nodes: number[];
    geometry: { lat: number; lon: number }[];
    tags: {
      bicycle: 'yes';
      foot: 'yes';
      highway: 'footway' | 'path' | 'track' | 'cycleway';
      source: string;
    };
  }[];
};
const overpassURL = (bbox: Bbox) => {
  const baseURL = [`https://overpass.kumi.systems/api/interpreter?`, `https://overpass-api.de/api/interpreter?`][
    Math.floor(Math.random() * 2)
  ];
  const query = encodeURI(
    // `data=[bbox:${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}][out:json][timeout:25];(way["highway"="track"];);out geom;`
    `data=[bbox:${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}][out:json][timeout:25];(way["highway"]["surface"~"unpaved|gravel|dirt|fine_gravel"];way["highway"="track"]["tracktype"~"grade2|grade3"];way["highway"="track"]["name"];);out geom;`
  );
  return baseURL.concat(query);
};

export const fetchOverpassData = async (bbox: Bbox) => {
  const res = await fetch(overpassURL(bbox));
  const data = await res.json();
  return data as OverpassData;
};

/*
[out:json][timeout:95];
(
  node["craft"="brewery"]({{bbox}});
   node["microbrewery"="yes"]({{bbox}});
     node["real_ale"="yes"]({{bbox}});
);
out geom;
*/

/*
// DEFINITELY DIRT
[out:json][timeout:95];
(
  way["highway"]["surface"~"unpaved|gravel|fine_gravel|dirt|cobblestone|compacted|earth|ground"]({{bbox}});
  way["highway"]["tracktype"~"grade2|grade3|grade4"]({{bbox}});
);
out geom;
*/

//europe 207, 237

/*
// FOREST ROAD NOT NECESSARILY DIRT
[out:json][timeout:95];
// gather results
(
  way["highway"="track"]["surface"!~"gravel|dirt|unpaved|fine_gravel|cobblestone|compacted|earth|ground"]["tracktype"!~"grade2|grade3|grade4|grade5"]({{bbox}});
);
out geom;
*/

/*
PATHS
[out:json][timeout:95];
// gather results
(
  way["highway"="path"]({{bbox}});
);
out geom;
*/

/*
MTB
[out:json][timeout:10000][bbox:{{bbox}}];
relation["route"="mtb"];
out geom;
*/
