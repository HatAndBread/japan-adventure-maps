import React from "react";
import axios from "../../lib/axios";

const LikeButton = ({
  userId,
  likeableId,
  likeableType,
  size
}: {
  userId: number;
  likeableId: number;
  likeableType: string;
  size?: 'fa-lg' | 'fa-sm' | 'fa-xs' | 'fa-xl' | 'fa-2xs' | 'fa-2xl'
}) => {
  const likeable_type = (): string => {
    if (likeableType === "Ride") return "rides";
  };
  const onClick = () => {
    axios.post(`/${likeable_type()}/like`, {
      user_id: userId,
      likeable_id: likeableId,
    });
  };
  return (
    <div className="like-button" onClick={onClick}>
      <i className={`fa fa-heart ${size ? size : ''}`} aria-hidden="true"></i>
    </div>
  );
};

export default LikeButton;
