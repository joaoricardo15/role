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
  FiShare,
  FiGrid,
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
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [shareScreen, setShareScreen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomAlias, setRoomAlias] = useState("");
  const [onlineRooms, setOnlineRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName")
  );
  const initialRoomName =
    new URLSearchParams(useLocation().search).get("initialRoomName") || "";

  const onNameChange = (name) => {
    localStorage.setItem("displayName", name || "");
    setDisplayName(name);
    if (videoApi) videoApi.executeCommand("displayName", name);
  };

  const openRoom = (roomName) => {
    setRoomAlias("");
    setRoomName(roomName);
    ReactGA.pageview(roomName);
  };

  const onRoomEnter = () => {
    updateMyStatus(displayName, roomName);
  };

  const onRoomLeave = () => {
    updateMyStatus(displayName, "");
  };

  const hangUp = () => {
    setRoomName(null);
    if (videoApi) videoApi.dispose();
    onRoomLeave();
  };

  const onShareScreen = (status) => {
    setShareScreen(status);
  };

  const onMuted = (muted) => {
    setMic(!muted);
  };

  const getRandomId = () => {
    return Math.random().toString(36);
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
    if (videoApi) videoApi.executeCommand("toggleTileView");
  };

  // const toggleChat = () => {
  //   if (videoApi) videoApi.executeCommand("toggleChat");
  // };

  const toggleShateScreen = () => {
    if (videoApi) videoApi.executeCommand("toggleShareScreen");
  };

  const startServerConnection = (userId) => {
    websocketClient = new w3cwebsocket(
      `${serverUrl}/?id=${userId}&displayName=${displayName}&roomName=${initialRoomName}`
    );

    websocketClient.onmessage = (message) => {
      const payload = JSON.parse(message.data);
      if (payload.newRoomName) setRoomAlias(payload.newRoomName);

      if (payload.onlineUsers) setOnlineUsers(payload.onlineUsers);
      if (payload.onlineRooms) {
        setOnlineRooms(payload.onlineRooms);

        const currentRoom = roomName || initialRoomName;
        if (currentRoom) {
          const myRoomOnOnlineRoomsIndex = payload.onlineRooms.findIndex(
            (x) => x.roomName === currentRoom
          );
          if (
            myRoomOnOnlineRoomsIndex > -1 &&
            payload.onlineRooms[myRoomOnOnlineRoomsIndex].roomAlias !==
              roomAlias
          )
            setRoomAlias(
              payload.onlineRooms[myRoomOnOnlineRoomsIndex].roomAlias
            );
        }
      }
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

  // const sendMessage = (message) => {
  //   if (videoApi) {
  //     videoApi.executeCommand(
  //       "sendEndpointTextMessage",
  //       "receiverParticipantId",
  //       message
  //     );
  //   }
  // };

  useEffect(() => {
    ReactGA.initialize("UA-170290043-1");
    let updatedUserId = userId;
    if (!updatedUserId) {
      updatedUserId = getRandomId();
      localStorage.setItem("userId", updatedUserId);
      setUserId(updatedUserId);
    }
    startServerConnection(updatedUserId);
    if (initialRoomName) openRoom(initialRoomName);
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
                  onChange={(e) => onNameChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiAtSign />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              {roomName && (
                <div className="currentRoomName">
                  <TextField
                    color="secondary"
                    value={roomAlias}
                    placeholder="nome da sala"
                    inputProps={{ min: 0, style: { textAlign: "center" } }}
                    onChange={(e) => setRoomAlias(e.target.value)}
                    onBlur={() =>
                      changeRoomName(displayName, roomName, roomAlias)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <img
                            className="currentRoomImage"
                            src={process.env.PUBLIC_URL + "logo.png"}
                            width="20"
                            alt="loading"
                          />
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
        {!roomName ? (
          <div className="noRoomContainer">
            {camera ? (
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
              roomName={roomName}
              onMuted={onMuted}
              onRoomEnter={onRoomEnter}
              onRoomLeave={onRoomLeave}
              onShareScreen={onShareScreen}
              camera={camera}
              mic={mic}
            />
          </div>
        )}
      </div>
      <div className="roomButtonContainer">
        {!roomName ? (
          <Button
            size="small"
            color="secondary"
            variant="contained"
            startIcon={<FiPlayCircle />}
            onClick={() => openRoom(getRandomId())}
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
                url={`https://www.injoy.chat/?initialRoomName=${roomName}`}
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
        <IconButton onClick={toggleCamera} className="controlPanelButton">
          {camera ? <FiVideo /> : <FiVideoOff />}
        </IconButton>
        <IconButton onClick={toggleMic}>
          {mic ? <FiMic /> : <FiMicOff />}
        </IconButton>
        <IconButton
          size="small"
          onClick={toggleViewMode}
          disabled={!roomName}
          className="controlPanelButton"
        >
          <FiGrid />
        </IconButton>
        {/* <IconButton size="small" onClick={toggleChat} disabled={!roomName} className="controlPanelButton" >
          <FiMessageSquare />
        </IconButton> */}
        {!isMobile && (
          <IconButton
            size="small"
            color={shareScreen && "secondary"}
            className="controlPanelButton"
            onClick={toggleShateScreen}
            disabled={!roomName}
          >
            <FiShare />
          </IconButton>
        )}
        <IconButton
          size="small"
          color="secondary"
          className="controlPanelButton"
          onClick={hangUp}
          disabled={!roomName}
        >
          <FiPhoneMissed />
        </IconButton>
      </ButtonGroup>
      {onlineRooms.length > 0 &&
        !(onlineRooms.length === 1 && onlineRooms[0].roomName === roomName) && (
          <div className="onlineRoomsListContainer">
            <div className="onlineRoomsListTitleContainer">
              <img
                className="currentRoomImage"
                src={process.env.PUBLIC_URL + "logo.png"}
                width="20"
                alt="loading"
              />
              <div className="onlineRoomsListTitle"> salas online </div>
            </div>
            <div className="onlineRoomsList">
              {onlineRooms.map(
                (onlineRoom) =>
                  onlineRoom.roomName !== roomName && (
                    <Card style={{ marginTop: 10 }}>
                      <div
                        className="onlineRoom"
                        onClick={() => openRoom(onlineRoom.roomName)}
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
