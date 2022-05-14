import React from "react";

const LikesCount = ({ likesCount }: { likesCount: number }) => {
  return (
    <div className='LikesCount' style={{ color: "darkred" }}>
      <i className="fa fa-heart"></i>
      <span style={{ position: "relative", top: "-4px", fontSize: "11px" }}>
        {likesCount}
      </span>
    </div>
  );
};

export default LikesCount;
