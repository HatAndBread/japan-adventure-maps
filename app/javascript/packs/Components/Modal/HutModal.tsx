import React from "react";
import { Hut } from "../../Types/Models";

const HutModal = ({ hut }: { hut: Hut }) => {
  return (
    <div className="hut-modal">
      <h1>
        {hut.name}
        {hut.nameEn && `(${hut.nameEn})`}
      </h1>
      {hut.url && (
        <a href={hut.url} target="_blank">
          Webpage
        </a>
      )}
    </div>
  );
};
export default HutModal;
