import React, { useEffect, useState } from "react";
import QuillDisplay from "../../Components/Quill/QuillDisplay";
import Delta from "quill-delta";
import { useAppContext } from "../../Context";
import {useRideContext} from '../../Rides/Ride';
import {LngLat} from 'mapbox-gl'

const PopupModal = ({
  popupData,
  isEditor,
  setPopupPos,
  popupPos,
  setPopupModalData,
}: {
  popupData: any;
  isEditor: boolean;
  setPopupPos: React.Dispatch<React.SetStateAction<LngLat>>
  setPopupModalData: React.Dispatch<React.SetStateAction<string>>
  popupPos: LngLat
}) => {
  const ctx = useAppContext();
  const [delta, setDelta] = useState<Delta>();
  const {popups, setPopups} = useRideContext();
  const belongsToUser =
    ctx.controllerData.currentUser?.id === ctx.controllerData.ride.userId;
  useEffect(() => {
    try {
      const d = new Delta(JSON.parse(popupData));
      setDelta(d);
    } catch {
      setDelta(new Delta())
    }
  }, [popupData]);
  const deletePopup = () => {
    const reply = confirm('Are you sure you want to delete this point of interest?');
    if (reply) {
      const newPopups = popups.filter((p)=> p.lngLat.lng !== popupPos.lng && p.lngLat.lat !== popupPos.lat)
      setPopupPos(undefined);
      setPopupModalData(undefined);
      setPopups(newPopups);
    }
  }

  return (
    <div>
      {belongsToUser && isEditor && (
        <div style={{position: 'absolute', top: '16px', left: '16px'}}>
          <a style={{marginRight: '8px'}} onClick={deletePopup}>
            <i className="fas fa-trash"></i>
          </a>
          <a
            onClick={() => {
              setPopupPos(popupPos);
              setPopupModalData(null);
            }}
          >
            <i className="fas fa-edit"></i>
          </a>
        </div>
      )}
      <QuillDisplay delta={delta} />
    </div>
  );
};
export default PopupModal;
