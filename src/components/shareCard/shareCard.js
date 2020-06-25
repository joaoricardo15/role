import React from "react";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { SwipeableListItem } from "@sandstreamdev/react-swipeable-list";
import Card from "@material-ui/core/Card";
import { FiTrash2 } from "react-icons/fi";
import "./shareCard.css";

const ShareCardComponent = ({ title, message, onClick, onSwipe }) => {
  const share = () => {
    document.getElementById("shareButton").click();
  };

  const renderContent = () => (
    <Card>
      <div className="container" onClick={onClick || share}>
        <div className="title">{title}</div>
        <div className="shareButton">
          {message && (
            <WhatsappShareButton
              id="shareButton"
              url={`https://injoy.chat/?initialRoomName=${message}`}
            >
              <WhatsappIcon size={20} round={true} />
            </WhatsappShareButton>
          )}
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
