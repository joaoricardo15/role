import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import Webcam from "react-webcam";
import { isMobile } from "react-device-detect";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { GiAstronautHelmet } from "react-icons/gi";
import { MdSend } from "react-icons/md";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneMissed,
  FiMessageSquare,
  //FiPlayCircle,
  FiX,
  FiPlay,
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
//import InstallCardComponent from "../../components/installCard/installCard";
import noVideoAnimation from "./../../assets/astronaut.gif";
import launchAnimation from "./../../assets/launch.gif";
import "./main.css";

let websocketClient;
const serverUrl = "wss://18b0p3qzk7.execute-api.us-east-1.amazonaws.com/beta";

const MainPage = () => {
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [titleviewStatus, setTitleviewStatus] = useState(false);
  const [shareScreenStatus, setShareScreenStatus] = useState(false);
  const [messageInputStatus, setMessageInputStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [isRandomRoomLoading, setIsRandomRoomLoading] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentRoomAlias, setCurrentRoomAlias] = useState("");
  const [onlineRooms, setOnlineRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
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
    setCurrentRoomName(roomName);
    ReactGA.pageview(roomName);
  };

  const leaveRoom = () => {
    if (videoApi) videoApi.dispose();
    setCurrentRoomName("");
    setCurrentRoomAlias("");
    setTitleviewStatus(false);
    setShareScreenStatus(false);
    setMessageInputStatus(false);
    onRoomLeave();
  };

  const changeVideoStatus = () => {
    if (!currentRoomName && !isRoomLoading) setVideoStatus(!videoStatus);
    else if (videoApi) videoApi.executeCommand("toggleVideo");
  };

  const changeAudioStatus = () => {
    if (!currentRoomName && !isRoomLoading) setAudioStatus(!audioStatus);
    else if (videoApi) videoApi.executeCommand("toggleAudio");
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
    updateMyStatus(displayName, "");
  };

  const onRoomEntered = () => {
    setIsRoomLoading("");
    updateMyStatus(displayName, currentRoomName);
  };

  const onAudioStatusChanged = (audioStatus) => {
    setAudioStatus(audioStatus);
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

  const startServerConnection = (userId) => {
    websocketClient = new w3cwebsocket(
      `${serverUrl}/?id=${userId}&displayName=${displayName}`
    );

    websocketClient.onopen = () => {
      websocketClient.onmessage = (message) => {
        const payload = JSON.parse(message.data);
        if (payload.newRoomName) {
          setCurrentRoomAlias(payload.newRoomName);
        }

        if (payload.randomRoomName) {
          requestRandomRoom(false);
          enterRoom(payload.randomRoomName);
          setIsRandomRoomLoading(false);
        }

        if (payload.message) {
          alert(
            `${payload.id === userId ? "Eu" : payload.displayName} disse: ${
              payload.message
            }`
          );
        }

        if (payload.onlineUsers) {
          setOnlineUsers(payload.onlineUsers);
        }

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

  const requestRandomRoom = (enable) => {
    setIsRandomRoomLoading(enable);
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(
        JSON.stringify({
          action: "onRandomRoom",
          data: {
            enable,
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

      setMessage("");
      setMessageInputStatus("");
    }
  };

  const changeMessageInputStatus = () => {
    setMessageInputStatus(!messageInputStatus);
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
              {currentRoomName && !isRoomLoading && (
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
          <div>
            {isRandomRoomLoading ? (
              <div className="loadingContainer">
                <img src={launchAnimation} width="100%" alt="loading" />
                <div className="loadingTitle">
                  procurando pessoa aleatória...
                </div>
              </div>
            ) : (
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

                <div className="noRoomTitleContainer">
                  <div className="noRoomTitle">você não está conectado.</div>
                  <div
                    onClick={() => enterRoom(getRandomId())}
                    className="noRoomCreateRoomButtom"
                  >
                    Criar Sala
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="RoomContainer">
            {isRoomLoading && (
              <div className="loadingContainer">
                <img src={launchAnimation} width="100%" alt="loading" />
                <div className="loadingTitle">entrando na sala...</div>
              </div>
            )}
            <div
              className={isRoomLoading ? "hiddenContainer" : "visibleContainer"}
            >
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
          </div>
        )}
        {messageInputStatus && (
          <div className="messageContainer">
            <TextField
              multiline
              autoFocus
              rows={1}
              rowsMax={4}
              color="secondary"
              value={message}
              placeholder="menssagem"
              variant="filled"
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                className: "sendMessageInput",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => sendMessage(message)}
                      className="sendMessageButton"
                      edge="end"
                    >
                      <MdSend />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
      </div>
      <div className="roomButtonContainer">
        {!currentRoomName ? (
          isRandomRoomLoading ? (
            <Button
              size="small"
              color="secondary"
              variant="contained"
              startIcon={<FiX />}
              onClick={() => requestRandomRoom(false)}
            >
              Cancelar busca
            </Button>
          ) : (
            <div className="initialButtonsContainer">
              {/* <Button
                size="small"
                color="secondary"
                variant="contained"
                startIcon={<FiMapPin />}
                onClick={() => enterRoom(getRandomId())}
              >
                Criar nova sala
              </Button> */}
              <Button
                size="small"
                color="secondary"
                variant="contained"
                startIcon={<GiAstronautHelmet />} //<FiPlay />}
                onClick={() => requestRandomRoom(true)}
              >
                Sala aleatória
              </Button>
            </div>
          )
        ) : (
          !messageInputStatus && (
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
          )
        )}
      </div>
      {!isRoomLoading && !isRandomRoomLoading && (
        <ButtonGroup
          className={currentRoomName ? "controlPanel" : "initialControlPanel"}
        >
          <IconButton
            onClick={changeVideoStatus}
            className="controlPanelButton"
          >
            {videoStatus ? <FiVideo /> : <FiVideoOff />}
          </IconButton>
          <IconButton onClick={changeAudioStatus}>
            {audioStatus ? <FiMic /> : <FiMicOff />}
          </IconButton>
          {currentRoomName && !isRoomLoading && (
            <div className="initialControlPanelButtonsContainer">
              <IconButton
                size="small"
                onClick={changeMessageInputStatus}
                disabled={!currentRoomName || isRoomLoading}
                className="controlPanelButton"
              >
                <FiMessageSquare />
              </IconButton>
              <IconButton
                size="small"
                onClick={changeTileviewStatus}
                disabled={!currentRoomName || isRoomLoading}
                className="controlPanelButton"
              >
                {titleviewStatus ? <FiGrid /> : <FiSquare />}
              </IconButton>
              {!isMobile && (
                <IconButton
                  size="small"
                  color={shareScreenStatus && "secondary"}
                  className="controlPanelButton"
                  onClick={changeShareScreenStatus}
                  disabled={!currentRoomName || isRoomLoading}
                >
                  <FiShare />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="secondary"
                className="controlPanelButton"
                onClick={leaveRoom}
                disabled={!currentRoomName || isRoomLoading}
              >
                <FiPhoneMissed />
              </IconButton>
            </div>
          )}
        </ButtonGroup>
      )}
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
      {/* <InstallCardComponent /> */}
    </StickyContainer>
  );
};

export default MainPage;
