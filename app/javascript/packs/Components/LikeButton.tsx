import React from "react";
import axios from "../../lib/axios";
import {flash} from '../../lib/flash';

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
  const onClick = async () => {
    const res = await axios.post(`/likes`, {
      user_id: userId,
      likeable_id: likeableId,
      likeable_type: likeableType
    });
    if (res.data.success) {
      flash('Like saved!', 'success')
    } else {
      if (res.data.message) flash(res.data.message, 'error');
    }
  };
  return (
    <div className="like-button" onClick={onClick}>
      <i className={`fa fa-heart ${size ? size : ''}`} aria-hidden="true" style={{cursor: 'pointer'}}></i>
    </div>
  );
};

export default LikeButton;
