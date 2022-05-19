import React from "react";
import { TrackModalData } from "../../Types/Models";

const TrackModal = ({ track }: { track: TrackModalData }) => {
  return (
    <div className="track-modal">
      <h1>{track.name}</h1>
      {track.url && (
        <iframe
          width="300"
          src={track.url}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};
export default TrackModal;
