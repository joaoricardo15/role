import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneMissed,
  FiGrid,
  FiPlusCircle,
  FiPlayCircle,
} from "react-icons/fi";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
import { RoomCardComponent } from "../../components/roomCard/roomCard";
import "./main.css";

const MainPage = () => {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(true);
  const [viewMode, setViewMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [recentRooms, setRecentRooms] = useState(
    JSON.parse(localStorage.getItem("recentRooms"))
  );
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName")
  );
  const initialRoomName = new URLSearchParams(useLocation().search).get(
    "initialRoomName"
  );

  const onNameChange = (name) => {
    localStorage.setItem("displayName", name);
    setDisplayName(name);
    if (videoApi) videoApi.executeCommand("displayName", name);
  };

  const onCreateRoom = () => {
    if (newRoomName) openRoom(newRoomName);
    setNewRoomName("");
  };

  const deleteFromRecentRooms = (roomName) => {
    const updatetRecentRooms = recentRooms.filter((x) => x !== roomName);
    setRecentRooms(updatetRecentRooms);
    localStorage.setItem("recentRooms", JSON.stringify(updatetRecentRooms));
  };

  const openRoom = (roomName) => {
    setLoading(true);
    setRoomName(roomName);
    updateRecentRooms(roomName);
    ReactGA.pageview(roomName);
  };

  const updateRecentRooms = (roomName) => {
    let updatedRecentRooms;
    if (recentRooms && recentRooms.length > 0) {
      for (var i = 0; i < recentRooms.length; i++)
        if (recentRooms[i] === roomName) recentRooms.splice(i, 1);
      recentRooms.splice(0, 0, roomName);
      updatedRecentRooms = recentRooms;
    } else {
      updatedRecentRooms = [roomName];
    }
    setRecentRooms(updatedRecentRooms);
    localStorage.setItem("recentRooms", JSON.stringify(updatedRecentRooms));
  };

  const onLoadRoom = () => {
    setLoading(false);
  };

  const toggleCamera = () => {
    setCamera(!camera);
    if (videoApi) videoApi.executeCommand("toggleVideo");
  };

  const toggleMic = () => {
    setMic(!mic);
    if (videoApi) videoApi.executeCommand("toggleAudio");
  };

  const toggleViewMode = () => {
    setViewMode(!viewMode);
    if (videoApi) videoApi.executeCommand("toggleTileView");
  };

  const hangUp = () => {
    setRoomName(null);
    if (videoApi) videoApi.dispose();
  };

  useEffect(() => {
    if (initialRoomName) openRoom(initialRoomName);
  }, []);

  return (
    <StickyContainer>
      <Sticky>
        {({ style }) => (
          <div className="header" style={style}>
            <div className="headerFirstLine">
              <div className="greetings">
                <div className="greetingsTitle">Olá</div>
                <input
                  className="nameInput"
                  value={displayName}
                  placeholder="Digite seu apelido"
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </div>
              <div className="controlPanel">
                <div onClick={toggleCamera}>
                  {camera ? <FiVideo /> : <FiVideoOff />}
                </div>
                <div onClick={toggleMic}>{mic ? <FiMic /> : <FiMicOff />}</div>
              </div>
            </div>
            {!loading &&
              (roomName ? (
                <div className="currentRoomContainer">
                  <div className="currentRoomIdentification">
                    <div className="currentRoomTitle">você está em </div>
                    <div className="currentRoomCard">
                      <RoomCardComponent roomName={roomName} />
                    </div>
                  </div>
                  <div className="currentRoomControlPainel">
                    <div onClick={toggleViewMode}>
                      <FiGrid />
                    </div>
                    <div onClick={hangUp}>
                      <FiPhoneMissed />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="newRoomContainer">
                  <div
                    className="randomRoomContainer"
                    onClick={() =>
                      openRoom(Math.random().toString(36).substring(7))
                    }
                  >
                    <div>rolê aleatório</div>
                    <div className="newRoomIcon">
                      <FiPlayCircle />
                    </div>
                  </div>
                  <div className="createRoomContainer">
                    <input
                      value={newRoomName}
                      className="createRoomInput"
                      placeholder="novo rolê"
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    <div className="newRoomIcon" onClick={onCreateRoom}>
                      <FiPlusCircle />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Sticky>
      <div className="videoContainer">
        {!roomName ? (
          !camera ? (
            <image src="./public/logo192.png" />
          ) : (
            <Webcam audio={false} width="100%" height="100%" mirrored />
          )
        ) : (
          <VideoFrameComponent
            roomName={roomName}
            onLoad={onLoadRoom}
            camera={camera}
            mic={mic}
          />
        )}
      </div>
      {recentRooms && recentRooms.length > 0 && (
        <div className="recentRoomsListContainer">
          <div>últimos rolês visitados</div>
          <div className="recentRoomsList">
            {recentRooms.map((recentRoomName, index) => (
              <div className="recentRoom">
                <RoomCardComponent
                  roomName={recentRoomName}
                  onClick={() => openRoom(recentRoomName)}
                  onSwipe={() => deleteFromRecentRooms(recentRoomName)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </StickyContainer>
  );
};

export default MainPage;
