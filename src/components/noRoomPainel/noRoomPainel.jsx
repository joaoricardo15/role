import React, { useState } from "react";
import Webcam from "react-webcam";
import { FiMapPin } from "react-icons/fi";
import { GiAstronautHelmet } from "react-icons/gi";
import { Fab } from "@material-ui/core";
import ChooseRoomPainelComponent from "../chooseRoomPainel/chooseRoomPainel";
import "./noRoomPainel.style.css";

const NoRoomPainelComponent = ({
  imageSource,
  onNewRoom,
  onRandomRoom,
  videoStatus,
  videoInputDeviceId,
}) => {
  const [chooseRoomPainelVisibility, setChooseRoomPainelVisibility] = useState(
    false
  );

  const closeRoom = () => {
    setChooseRoomPainelVisibility(false);
  };

  return (
    <div className="noRoomContainer">
      <img className="coverImage" src={imageSource} alt="astronautHelmet" />
      {videoStatus && videoInputDeviceId && (
        <div className="cameraContainer">
          <Webcam
            mirrored
            audio={true}
            className="camera"
            videoConstraints={{ deviceId: videoInputDeviceId }}
          />
        </div>
      )}
      <div className="navigateButtomContainer">
        <Fab
          size="small"
          color="secondary"
          variant="extended"
          className="navigateButton"
          onClick={() => setChooseRoomPainelVisibility(true)}
        >
          <GiAstronautHelmet />
          <div style={{ marginLeft: 10, marginRight: 10 }}>Explore!</div>
        </Fab>
      </div>
      <div className="roomButtonContainer">
        <Fab
          size="small"
          color="secondary"
          variant="extended"
          onClick={onNewRoom}
        >
          <FiMapPin />
          <div style={{ marginLeft: 10, marginRight: 10 }}>Criar sala</div>
        </Fab>
        {chooseRoomPainelVisibility && (
          <ChooseRoomPainelComponent
            opened={chooseRoomPainelVisibility}
            onClose={closeRoom}
            onRandomRoom={onRandomRoom}
          />
        )}
      </div>
    </div>
  );
};

export default NoRoomPainelComponent;
