import React from "react";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { SwipeableListItem } from "@sandstreamdev/react-swipeable-list";
import { FiTrash2 } from "react-icons/fi";
import "./roomCard.css";

export const RoomCardComponent = ({ roomName, onClick, onSwipe }) => {
  const renderContent = () => (
    <div className="container" onClick={onClick}>
      <div className="title">{roomName}</div>
      <div className="shareButton">
        <WhatsappShareButton
          url={`https://master.d2eac7u7abqstu.amplifyapp.com/?initialRoomName=${roomName}`}
        >
          <WhatsappIcon size={20} round={true} />
        </WhatsappShareButton>
      </div>
    </div>
  );

  return onSwipe ? (
    <SwipeableListItem
      swipeLeft={{
        content: (
          <div className="deleteButton">
            <FiTrash2 className="deleteIcon" />
          </div>
        ),
        action: onSwipe,
      }}
    >
      {renderContent()}
    </SwipeableListItem>
  ) : (
    renderContent()
  );
};
