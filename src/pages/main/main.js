import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import Webcam from "react-webcam";
import { isMobile } from "react-device-detect";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneMissed,
  //FiMessageSquare,
  FiPlayCircle,
  FiAtSign,
  FiMapPin,
  FiShare,
  FiGrid,
  FiSquare,
} from "react-icons/fi";
import {
  IconButton,
  TextField,
  InputAdornment,
  ButtonGroup,
  Button,
  Card,
} from "@material-ui/core";
import { w3cwebsocket } from "websocket";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
import InstallCardComponent from "../../components/installCard/installCard";
import noVideoAnimation from "./../../assets/astronaut.gif";
import "./main.css";

let websocketClient;
//const serverUrl = "ws://localhost:1000";
const serverUrl = "wss://18b0p3qzk7.execute-api.us-east-1.amazonaws.com/beta";

const MainPage = () => {
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [titleviewStatus, setTitleviewStatus] = useState(false);
  const [shareScreenStatus, setShareScreenStatus] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentRoomAlias, setCurrentRoomAlias] = useState("");
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [onlineRooms, setOnlineRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName")
  );
  const initialRoomName =
    new URLSearchParams(useLocation().search).get("initialRoomName") || "";

  const startUser = () => {
    let updatedUserId = userId;
    if (!updatedUserId) {
      updatedUserId = getRandomId();
      localStorage.setItem("userId", updatedUserId);
      setUserId(updatedUserId);
    }

    return updatedUserId;
  };

  const enterRoom = (roomName) => {
    setIsRoomLoading(true);
    setCurrentRoomAlias("");
    setCurrentRoomName(roomName);
    ReactGA.pageview(roomName);
  };

  const leaveRoom = () => {
    if (videoApi) videoApi.dispose();
    setCurrentRoomName("");
    setTitleviewStatus(false);
    setShareScreenStatus(false);
    onRoomLeave();
  };

  const changeVideoStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleVideo");
    else if (!currentRoomName && !isRoomLoading) setVideoStatus(!videoStatus);
  };

  const changeAudioStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleAudio");
    else if (!currentRoomName && !isRoomLoading) setAudioStatus(!audioStatus);
  };

  const changeTileviewStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleTileView");
  };

  const changeShareScreenStatus = () => {
    if (videoApi) videoApi.executeCommand("toggleShareScreen");
  };

  const changeDisplayName = (name) => {
    localStorage.setItem("displayName", name || "");
    setDisplayName(name);
    if (videoApi) videoApi.executeCommand("displayName", name);
  };

  const onRoomLeave = () => {
    setIsRoomLoading(false);
    updateMyStatus(displayName, "");
  };

  const onRoomEntered = () => {
    setIsRoomLoading(true);
    updateMyStatus(displayName, currentRoomName);
    sendMessage("hello from app");
  };

  const onAudioStatusChanged = (micStatus) => {
    setAudioStatus(micStatus);
  };

  const onVideoStatusChanged = (videoStatus) => {
    setVideoStatus(videoStatus);
  };

  const onTileviewStatusChanged = (tileviewStatus) => {
    setTitleviewStatus(tileviewStatus);
  };

  const onShareScreenStatusChanged = (shareScreenStatus) => {
    setShareScreenStatus(shareScreenStatus);
  };

  // const toggleChat = () => {
  //   if (videoApi) videoApi.executeCommand("toggleChat");
  // };

  const startServerConnection = (userId) => {
    websocketClient = new w3cwebsocket(
      `${serverUrl}/?id=${userId}&displayName=${displayName}&roomName=${initialRoomName}`
    );

    websocketClient.onopen = () => {
      websocketClient.onmessage = (message) => {
        const payload = JSON.parse(message.data);
        if (payload.newRoomName) setCurrentRoomAlias(payload.newRoomName);

        if (payload.onlineUsers) setOnlineUsers(payload.onlineUsers);
        if (payload.onlineRooms) {
          setOnlineRooms(payload.onlineRooms);

          const currentRoom = currentRoomName || initialRoomName;
          if (currentRoom) {
            const myRoomOnOnlineRoomsIndex = payload.onlineRooms.findIndex(
              (x) => x.roomName === currentRoom
            );
            if (
              myRoomOnOnlineRoomsIndex > -1 &&
              payload.onlineRooms[myRoomOnOnlineRoomsIndex].roomAlias !==
                currentRoomAlias
            )
              setCurrentRoomAlias(
                payload.onlineRooms[myRoomOnOnlineRoomsIndex].roomAlias
              );
          }
        }
      };

      if (initialRoomName) enterRoom(initialRoomName);
      else updateOnlineUsers();
    };
  };

  const updateMyStatus = (displayName, roomName) => {
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(
        JSON.stringify({
          action: "onRoomChange",
          data: {
            id: userId,
            displayName: displayName,
            roomName: roomName,
          },
        })
      );
    }
  };

  const updateOnlineUsers = () => {
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(JSON.stringify({ action: "updateOnlineUsers" }));
    }
  };

  const changeRoomName = (displayName, roomName, newRooName) => {
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(
        JSON.stringify({
          action: "onRoomNameChange",
          data: {
            displayName: displayName,
            roomName: roomName,
            newRoomName: newRooName,
          },
        })
      );
    }
  };

  const sendMessage = (message) => {
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(
        JSON.stringify({
          action: "onMessage",
          data: {
            id: userId,
            displayName: displayName,
            roomName: currentRoomName,
            message,
          },
        })
      );
    }
  };

  const getRandomId = () => {
    return Math.random().toString(36);
  };

  useEffect(() => {
    ReactGA.initialize("UA-170290043-1");
    const updatedUserId = startUser();
    startServerConnection(updatedUserId);
  }, []);

  return (
    <StickyContainer>
      <Sticky>
        {({ style }) => (
          <div className="header" style={style}>
            <div className="headerFirstLine">
              <div className="greetings">
                <TextField
                  color="secondary"
                  value={displayName}
                  placeholder="seu apelido"
                  onChange={(e) => changeDisplayName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiAtSign />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              {isRoomLoading && (
                <div className="currentRoomName">
                  <TextField
                    color="secondary"
                    value={currentRoomAlias}
                    placeholder="nome da sala"
                    inputProps={{ min: 0, style: { textAlign: "center" } }}
                    onChange={(e) => setCurrentRoomAlias(e.target.value)}
                    onBlur={() =>
                      changeRoomName(
                        displayName,
                        currentRoomName,
                        currentRoomAlias
                      )
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiMapPin />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Sticky>
      <div className="videoContainer">
        {!currentRoomName ? (
          <div className="noRoomContainer">
            {videoStatus ? (
              <div className="noRoomCameraContainer">
                <Webcam audio={true} className="noRoomCamera" mirrored />
              </div>
            ) : (
              <img
                className="noRoomNoCameraImage"
                src={noVideoAnimation}
                width="50%"
                alt="loading"
              />
            )}
            <div className="noRoomnoCameraTitle">
              você não está conectado à uma sala
            </div>
          </div>
        ) : (
          <div className="RoomContainer">
            <VideoFrameComponent
              mic={audioStatus}
              camera={videoStatus}
              roomName={currentRoomName}
              onRoomLeave={onRoomLeave}
              onRoomEntered={onRoomEntered}
              onAudioStatusChanged={onAudioStatusChanged}
              onVideoStatusChanged={onVideoStatusChanged}
              onTileviewStatusChanged={onTileviewStatusChanged}
              onShareScreenStatusChanged={onShareScreenStatusChanged}
            />
          </div>
        )}
      </div>
      <div className="roomButtonContainer">
        {!currentRoomName ? (
          <Button
            size="small"
            color="secondary"
            variant="contained"
            startIcon={<FiPlayCircle />}
            onClick={() => enterRoom(getRandomId())}
          >
            Criar sala
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            style={{ backgroundColor: "#25D365", color: "white" }}
            startIcon={
              <WhatsappShareButton
                id="shareButton"
                className="inviteShareButton"
                url={`https://www.injoy.chat/?initialRoomName=${currentRoomName}`}
              >
                <WhatsappIcon size={20} round={true} />
              </WhatsappShareButton>
            }
            onClick={() => document.getElementById("shareButton").click()}
          >
            Convidar amigos
          </Button>
        )}
      </div>
      <ButtonGroup className="controlPanel">
        <IconButton onClick={changeVideoStatus} className="controlPanelButton">
          {videoStatus ? <FiVideo /> : <FiVideoOff />}
        </IconButton>
        <IconButton onClick={changeAudioStatus}>
          {audioStatus ? <FiMic /> : <FiMicOff />}
        </IconButton>
        <IconButton
          size="small"
          onClick={changeTileviewStatus}
          disabled={!currentRoomName}
          className="controlPanelButton"
        >
          {titleviewStatus ? <FiGrid /> : <FiSquare />}
        </IconButton>
        {/* <IconButton size="small" onClick={toggleChat} disabled={!roomName} className="controlPanelButton" >
          <FiMessageSquare />
        </IconButton> */}
        {!isMobile && (
          <IconButton
            size="small"
            color={shareScreenStatus && "secondary"}
            className="controlPanelButton"
            onClick={changeShareScreenStatus}
            disabled={!currentRoomName}
          >
            <FiShare />
          </IconButton>
        )}
        <IconButton
          size="small"
          color="secondary"
          className="controlPanelButton"
          onClick={leaveRoom}
          disabled={!currentRoomName}
        >
          <FiPhoneMissed />
        </IconButton>
      </ButtonGroup>
      {onlineRooms.length > 0 &&
        !(
          onlineRooms.length === 1 &&
          onlineRooms[0].roomName === currentRoomName
        ) && (
          <div className="onlineRoomsListContainer">
            <div className="onlineRoomsListTitleContainer">
              <img
                className="onlineRoomsListIcon"
                src={process.env.PUBLIC_URL + "logo.png"}
                width="30"
                alt="loading"
              />
              <div className="onlineRoomsListTitle"> salas online </div>
            </div>
            <div className="onlineRoomsList">
              {onlineRooms.map(
                (onlineRoom) =>
                  onlineRoom.roomName !== currentRoomName && (
                    <Card style={{ marginTop: 10 }}>
                      <div
                        className="onlineRoom"
                        onClick={() => enterRoom(onlineRoom.roomName)}
                      >
                        <div className="onlineRoomNameContainer">
                          <div className="onlineRoomName">
                            {onlineRoom.roomAlias || "sala sem nome"}
                          </div>
                        </div>
                        <div className="onlineRoomUsersList">
                          {onlineRoom.users.map((onlineUser, index) => (
                            <div className="onlineRoomUserName">
                              {`${index === 0 ? "" : ", "}@${
                                onlineUser.displayName || "sem nome"
                              }`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )
              )}
            </div>
          </div>
        )}
      {/* <div>
          {onlineUsers.map((onlineUser) => (
            <div>{onlineUser.displayName} </div>
          ))}
        </div> */}
      <InstallCardComponent />
    </StickyContainer>
  );
};

export default MainPage;
