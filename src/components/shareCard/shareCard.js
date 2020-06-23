import React from "react";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { SwipeableListItem } from "@sandstreamdev/react-swipeable-list";
import Card from "@material-ui/core/Card";
import { FiTrash2 } from "react-icons/fi";
import "./shareCard.css";

const ShareCardComponent = ({ text, roomName, onClick, onSwipe }) => {
  const renderContent = () => (
    <Card>
      <div className="container" onClick={onClick}>
        <div className="title">{text || roomName}</div>
        <div className="shareButton">
          <WhatsappShareButton
            url={`https://master.d2eac7u7abqstu.amplifyapp.com/?initialRoomName=${roomName}`}
          >
            <WhatsappIcon size={20} round={true} />
          </WhatsappShareButton>
        </div>
      </div>
    </Card>
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

export default ShareCardComponent;
