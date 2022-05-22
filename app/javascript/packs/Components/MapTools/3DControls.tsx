import React, { useEffect, useState } from "react";
import { Map } from "mapbox-gl";
import north from "../../../../assets/images/north.svg";
import tdImage from "../../../../assets/images/3d.png";

let rotating = false;
let rotatingPitch = false;
const rotate = (map: Map, direction: 1 | -1) => {
  map.setBearing(map.getBearing() + direction);
  rotating && window.requestAnimationFrame(() => rotate(map, direction));
};

const rotatePitch = (map: Map, direction: 1 | -1) => {
  map.setPitch(map.getPitch() + direction);
  rotatingPitch &&
    window.requestAnimationFrame(() => rotatePitch(map, direction));
};

const Controls3D = ({ map }: { map: Map }) => {
  const [show, setShow] = useState(
    window.localStorage.getItem("dismissed-3d") !== "true"
  );
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
  if (!show) {
    return (
      <div
        className="MapControls3d"
        title="Explore the map in 3D"
        onClick={() => {
          setShow(true);
        }}
        style={{ cursor: "pointer", backgroundColor: 'transparent' }}
      >
        <img src={tdImage} height={24}></img>
      </div>
    );
  }
  return (
    <div className="MapControls3d" title="Explore the map in 3D">
      <div
        className="closer-container"
        style={{
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "flex-end",
          color: "snow",
        }}
      >
        <div
          style={{ position: "relative", right: "8px" }}
          onClick={() => {
            setShow(false);
            window.localStorage.setItem("dismissed-3d", "true");
          }}
        >
          <i className="fas fa-times pointer"></i>
        </div>
      </div>
      {window.localStorage.getItem("dismissed-3d") !== "true" && (
        <div
          style={{
            padding: "8px",
            borderRadius: "6px",
            display: "flex",
            fontWeight: 400,
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          Explore the Map in 3D&nbsp;<img src={tdImage} height={24}></img>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <td></td>
            <td>
              {" "}
              <button
                className="map-tool-button"
                onMouseDown={() => {
                  start(-1);
                }}
                onMouseUp={end}
                onTouchStart={() => start(1)}
                onTouchEnd={() => end}
              >
                <i className="fas fa-arrow-up"></i>
              </button>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              {" "}
              <button
                className="map-tool-button"
                onMouseDown={() => {
                  if (map) {
                    rotating = true;
                    rotate(map, 1);
                  }
                }}
                onMouseUp={() => {
                  rotating = false;
                }}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            </td>
            <td>
              {" "}
              <button
                onClick={() => map.resetNorth()}
                className="map-tool-button"
              >
                <img
                  src={north}
                  style={{ width: "100%", height: "100%" }}
                ></img>
              </button>
            </td>
            <td>
              {" "}
              <button
                className="map-tool-button"
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
                }}
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              {" "}
              <button
                className="map-tool-button"
                onMouseDown={() => {
                  if (map) {
                    rotatingPitch = true;
                    rotatePitch(map, 1);
                  }
                }}
                onMouseUp={() => {
                  rotatingPitch = false;
                }}
              >
                <i className="fas fa-arrow-down"></i>
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
