import React from "react";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import "./recentRoom.css";

export const RecentRoomComponent = ({ roomName, onClick }) => {
  return (
    <div className="container" onClick={onClick}>
      <div className="title">{roomName}</div>
      <div className="shareButton">
        <WhatsappShareButton
          url={`https://master.d2eac7u7abqstu.amplifyapp.com/${roomName}`}
        >
          <WhatsappIcon size={32} round={true} />
        </WhatsappShareButton>
      </div>
    </div>
  );
};
