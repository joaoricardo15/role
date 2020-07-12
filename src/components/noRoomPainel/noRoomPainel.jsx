import React from "react";
import Webcam from "react-webcam";
import { FiMapPin, FiPlay } from "react-icons/fi";
import { Fab } from "@material-ui/core";
import "./noRoomPainel.style.css";

const NoRoomPainelComponent = ({
  imageSource,
  onNewRoom,
  onRandomRoom,
  videoStatus,
  videoInputDeviceId,
}) => {
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
      <div className="roomButtonContainer">
        <div
          className="initialButtonsContainer"
          style={{ flexDirection: "column" }}
        >
          <Fab
            size="small"
            color="secondary"
            variant="outlined"
            style={{
              height: 20,
              color: "#f50057",
              backgroundColor: "white",
            }}
            onClick={onRandomRoom}
          >
            <FiPlay />
            <div
              style={{
                marginLeft: 10,
                marginRight: 10,
                fontSize: 10,
              }}
            >
              sala aleatória
            </div>
          </Fab>
          <Fab
            size="small"
            color="secondary"
            variant="extended"
            onClick={onNewRoom}
          >
            <FiMapPin />
            <div style={{ marginLeft: 10, marginRight: 10 }}>Criar sala</div>
          </Fab>
        </div>
      </div>
    </div>
  );
};

export default NoRoomPainelComponent;
