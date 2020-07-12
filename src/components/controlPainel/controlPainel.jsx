import React from "react";
import { isMobile } from "react-device-detect";
import { Fab } from "@material-ui/core";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiMessageSquare,
  FiGrid,
  FiPhoneMissed,
  FiShare,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { videoApi } from "./../../components/videoFrame/videoFrame";
import "./controlPainel.style.css";

const ControlPainelComponent = ({
  currentRoomName,
  videoStatus,
  audioStatus,
  filmStripStatus,
  titleviewStatus,
  shareScreenStatus,
  messageInputStatus,
  onToggleVideo,
  onToggleAudio,
  onToggleMessage,
  onToggleTileview,
  onToggleFilmstrip,
  onToggleSharescreen,
  onToggleHangup,
}) => {
  const changeVideoStatus = () => {
    if (onToggleVideo) onToggleVideo();
    if (videoApi) videoApi.executeCommand("toggleVideo");
  };

  const changeAudioStatus = () => {
    if (onToggleAudio) onToggleAudio();
    if (videoApi) videoApi.executeCommand("toggleAudio");
  };

  const changeTileviewStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleTileView");
    if (onToggleTileview) onToggleTileview();
  };

  const changeFilmstripStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleFilmStrip");
    if (onToggleFilmstrip) onToggleFilmstrip();
  };

  const changeShareScreenStatus = () => {
    if (onToggleSharescreen) onToggleSharescreen();
    if (videoApi) videoApi.executeCommand("toggleShareScreen");
  };

  const changeMessageInputStatus = () => {
    if (onToggleMessage) onToggleMessage();
  };

  return (
    <>
      <div className="controlPanelContainer">
        <div
          className={!currentRoomName ? "initialControlPanel" : "controlPanel"}
        >
          {!(currentRoomName && !filmStripStatus) && (
            <>
              <Fab
                onClick={changeVideoStatus}
                className="controlPanelButton"
                size="small"
              >
                {videoStatus ? (
                  <FiVideo />
                ) : (
                  <FiVideoOff style={{ color: "#f50057" }} />
                )}
              </Fab>
              <Fab
                onClick={changeAudioStatus}
                className="controlPanelButton"
                size="small"
              >
                {audioStatus ? (
                  <FiMic />
                ) : (
                  <FiMicOff style={{ color: "#f50057" }} />
                )}
              </Fab>
            </>
          )}
          {currentRoomName && filmStripStatus && (
            <>
              <Fab
                size="small"
                onClick={changeMessageInputStatus}
                className="controlPanelButton"
              >
                <FiMessageSquare
                  style={messageInputStatus && { color: "#f50057" }}
                />
              </Fab>

              <Fab
                size="small"
                onClick={changeTileviewStatus}
                className="controlPanelButton"
              >
                <FiGrid style={titleviewStatus && { color: "#f50057" }} />
              </Fab>
              <Fab
                size="small"
                className="controlPanelButton"
                onClick={changeShareScreenStatus}
              >
                <FiShare style={shareScreenStatus && { color: "#f50057" }} />
              </Fab>
              <Fab size="small" color="secondary" onClick={onToggleHangup}>
                <FiPhoneMissed />
              </Fab>
            </>
          )}
        </div>
      </div>
      {currentRoomName && (
        <Fab
          onClick={changeFilmstripStatus}
          className="filmtripButton"
          size="small"
        >
          {filmStripStatus ? (
            <FiChevronRight />
          ) : (
            <FiChevronLeft style={{ color: "#f50057" }} />
          )}
        </Fab>
      )}
    </>
  );
};

export default ControlPainelComponent;
