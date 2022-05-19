import React from "react";
import { Bed } from "../../Types/Models";

const BedModal = ({ bed }: { bed: Bed }) => {
  return (
    <div className="bed-modal">
      <h1>{bed.name}</h1>
      <p>Type: {bed.type}</p>
      {bed.url && (
        <a href={bed.url} target="_blank">
          Webpage
        </a>
      )}
    </div>
  );
};
export default BedModal;
