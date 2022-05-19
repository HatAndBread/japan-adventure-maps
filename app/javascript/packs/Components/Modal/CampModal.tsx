import React from "react";
import { Camp } from "../../Types/Models";

const CampModal = ({ camp }: { camp: Camp }) => {
  return (
    <div className="camp-modal">
      <h1>{camp.name}</h1>
      {camp.url && (
        <a href={camp.url} target="_blank">
          Webpage
        </a>
      )}
    </div>
  );
};
export default CampModal;
