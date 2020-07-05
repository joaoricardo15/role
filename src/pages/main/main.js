import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import Webcam from "react-webcam";
import { isMobile } from "react-device-detect";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import ScaleLoader from "react-spinners/ScaleLoader";
import { MdSend } from "react-icons/md";
import {
  FiMic,
  FiVideo,
  FiMicOff,
  FiVideoOff,
  FiPhoneMissed,
  FiMessageSquare,
  FiPlay,
  FiAtSign,
  FiMapPin,
  FiCheck,
  FiShare,
  FiGrid,
  FiMenu,
  FiInfo,
  FiX,
} from "react-icons/fi";
import {
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Card,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  withStyles,
} from "@material-ui/core";
import { w3cwebsocket } from "websocket";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
// import InstallCardComponent from "../../components/installCard/installCard";
import astronautHelmet from "./../../assets/astronautHelmet.png";
import randomRoomAnimation from "./../../assets/search.gif";
import launchAnimation from "./../../assets/launch.gif";
import "./main.css";

let websocketClient;
const serverUrl = "wss://18b0p3qzk7.execute-api.us-east-1.amazonaws.com/beta";

const CssTextField = withStyles({
  root: {
    "& .MuiInput-underline:before, .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "unset",
    },
    "& .MuiInputBase-input": {
      textOverflow: "ellipsis",
    },
  },
})(TextField);

const MainPage = () => {
  const webcamRef = React.useRef(null);
  const [devices, setDevices] = useState({});
  const [videoInputDevice, setVideoInputDevice] = useState(null);
  const [videoMenuOpenStatus, setVideoMenuOpenStatus] = useState(null);
  const [audioInputDevice, setAudioInputDevice] = useState(null);
  const [audioMenuOpenStatus, setAudioMenuOpenStatus] = useState(null);
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [titleviewStatus, setTitleviewStatus] = useState(false);
  const [filmStripStatus, setFilmStripStatus] = useState(true);
  const [drawerOpenStatus, setDrawerOpenStatus] = useState(false);
  const [shareScreenStatus, setShareScreenStatus] = useState(false);
  const [messageInputStatus, setMessageInputStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [youtubeVideo, setYoutubeVideo] = useState(null);
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

  const startMedioDevices = () => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        const videoInputDevices = [];
        const audioInputDevices = [];
        const audioOutputDevices = [];
        for (let i = 0; i < devices.length; i++) {
          if (devices[i].kind === "videoinput") {
            videoInputDevices.push({
              id: devices[i].deviceId,
              label: devices[i].label,
            });
          } else if (devices[i].kind === "audioinput") {
            audioInputDevices.push({
              id: devices[i].deviceId,
              label: devices[i].label,
            });
          } else if (devices[i].kind === "audiooutput") {
            audioOutputDevices.push({
              id: devices[i].deviceId,
              label: devices[i].label,
            });
          }
        }
        setDevices({ videoInputDevices, audioInputDevices });
        setVideoInputDevice(videoInputDevices[videoInputDevices.length - 1]);
        setAudioInputDevice(audioInputDevices[audioInputDevices.length - 1]);
      })
      .catch(function (err) {
        console.log(err.name + ": " + err.message);
      });
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

  const changeMessageInputStatus = () => {
    setMessageInputStatus(!messageInputStatus);
  };

  const changeDisplayName = (name) => {
    if (videoApi) videoApi.executeCommand("displayName", name);
    localStorage.setItem("displayName", name || "");
    updateMyStatus(displayName, currentRoomName);
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

  const onRoomLeave = () => {
    localStorage.setItem("connectionid", null);
    localStorage.setItem("roomName", null);
    updateMyStatus(displayName, "");
  };

  const onRoomEntered = (id) => {
    setIsRoomLoading("");
    localStorage.setItem("connectionid", id);
    localStorage.setItem("roomName", currentRoomName);
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

  const onFilmStripStatusChanged = (filmStripStatus) => {
    setFilmStripStatus(filmStripStatus);
  };

  const onChangeDisplayName = (id, name) => {
    if (id === localStorage.getItem("connectionid")) {
      if (name !== displayName) setDisplayName(name);
      localStorage.setItem("displayName", name || "");
    }
  };

  const startServerConnection = (userId) => {
    websocketClient = new w3cwebsocket(
      `${serverUrl}/?id=${userId}&displayName=${displayName}`
    );

    websocketClient.onopen = () => {
      websocketClient.onmessage = onRoomMessage;

      if (initialRoomName) enterRoom(initialRoomName);
      else updateOnlineUsers();
    };
  };

  const onRoomMessage = (message) => {
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
      if (payload.message.includes("youtube")) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = payload.message.match(regExp);
        setYoutubeVideo({
          videoId: match && match[7].length == 11 ? match[7] : false,
          displayName: payload.displayName,
        });
      } else
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
      const localRoomName = localStorage.getItem("roomName");
      if (localRoomName) {
        const myRoomOnOnlineRoomsIndex = payload.onlineRooms.findIndex(
          (x) => x.roomName === localRoomName
        );
        if (myRoomOnOnlineRoomsIndex > -1) {
          setCurrentRoomAlias(
            payload.onlineRooms[myRoomOnOnlineRoomsIndex].roomAlias
          );
        }
      }
    }
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

  const closeYoutubeVideo = () => {
    const youtubeVideoContainer = document.getElementById("youtubeVideoFrame");
    youtubeVideoContainer.parentNode.removeChild(youtubeVideoContainer);
    setYoutubeVideo(null);
  };

  const getRandomId = () => {
    return Math.random().toString(36);
  };

  const toggleDrawer = (open) => {
    setDrawerOpenStatus(open);
  };

  useEffect(() => {
    ReactGA.initialize("UA-170290043-1");
    const updatedUserId = startUser();
    startServerConnection(updatedUserId);
    startMedioDevices();
  }, []);

  return (
    <StickyContainer>
      <Sticky>
        {({ style }) => (
          <div className="header" style={style}>
            <div className="headerFirstLine">
              <div className="greetings">
                <CssTextField
                  color="secondary"
                  value={displayName}
                  placeholder="seu apelido"
                  className="greetingsInput"
                  textOverflow="ellipsis"
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => changeDisplayName(displayName)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiAtSign />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div>
                <IconButton
                  onClick={() => {
                    startMedioDevices();
                    toggleDrawer(true);
                  }}
                >
                  <FiMenu />
                </IconButton>
              </div>
            </div>
          </div>
        )}
      </Sticky>
      <Drawer
        anchor={"right"}
        open={drawerOpenStatus}
        onClose={() => toggleDrawer(false)}
      >
        <List style={{ padding: 10 }}>
          {[
            {
              text: "Video",
              icon: <FiVideo />,
              action: (event) => setVideoMenuOpenStatus(event.currentTarget),
            },
            {
              text: "Audio",
              icon: <FiMic />,
              action: (event) => setAudioMenuOpenStatus(event.currentTarget),
            },
            {
              text: "Sobre",
              icon: <FiInfo />,
              action: null,
            },
          ].map((menu, index) => (
            <ListItem button key={menu.text} onClick={menu.action}>
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.text} />
              <Menu
                id="simple-menu"
                anchorEl={videoMenuOpenStatus}
                keepMounted
                open={Boolean(videoMenuOpenStatus)}
                onClose={() => setVideoMenuOpenStatus(null)}
              >
                {devices.videoInputDevices &&
                  devices.videoInputDevices.map((videoDevice) => (
                    <MenuItem
                      onClick={(event) => {
                        setVideoMenuOpenStatus(null);
                        setVideoInputDevice({
                          label: videoDevice.label,
                          id: videoDevice.id,
                        });
                        if (videoApi)
                          videoApi.setVideoInputDevice(
                            videoDevice.label,
                            videoDevice.id
                          );
                        event.stopPropagation();
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: 8,
                          minWidth: 20,
                        }}
                      >
                        {videoInputDevice &&
                          videoInputDevice.id === videoDevice.id && (
                            <FiCheck style={{ color: "green" }} />
                          )}
                      </div>
                      <div
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {videoDevice.label}
                      </div>
                    </MenuItem>
                  ))}
              </Menu>
              <Menu
                id="simple-menu"
                anchorEl={audioMenuOpenStatus}
                keepMounted
                open={Boolean(audioMenuOpenStatus)}
                onClose={() => setAudioMenuOpenStatus(null)}
              >
                {devices.audioInputDevices &&
                  devices.audioInputDevices.map((audioDevice) => (
                    <MenuItem
                      onClick={(event) => {
                        setAudioMenuOpenStatus(null);
                        setAudioInputDevice({
                          label: audioDevice.label,
                          id: audioDevice.id,
                        });
                        if (videoApi)
                          videoApi.setAudioInputDevice(
                            audioDevice.label,
                            audioDevice.id
                          );
                        event.stopPropagation();
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: 8,
                          minWidth: 20,
                        }}
                      >
                        {audioInputDevice &&
                          audioInputDevice.id === audioDevice.id && (
                            <FiCheck style={{ color: "green" }} />
                          )}
                      </div>
                      <div
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {audioDevice.label}
                      </div>
                    </MenuItem>
                  ))}
              </Menu>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <div className="videoContainer">
        {!currentRoomName ? (
          <div>
            {isRandomRoomLoading ? (
              <div className="loadingContainer">
                <img src={randomRoomAnimation} width="100%" alt="loading" />
                <div className="loadingTitleContainer">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex" }}>
                      <div className="loadingTitle">
                        procurando sala no espaço...
                      </div>
                      <ScaleLoader height={18} color="#f50057" loading={true} />
                    </div>
                    <Button
                      size="small"
                      color="secondary"
                      variant="outlined"
                      startIcon={<FiX />}
                      style={{ marginTop: 40 }}
                      onClick={() => requestRandomRoom(false)}
                    >
                      Cancelar busca
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="noRoomContainer">
                <img
                  className="noRoomAstronautHelmet"
                  src={astronautHelmet}
                  alt="astronautHelmet"
                />
                {videoStatus && videoInputDevice && (
                  <div className="noRoomCameraContainer">
                    <Webcam
                      audio={true}
                      className="noRoomCamera"
                      mirrored
                      ref={webcamRef}
                      videoConstraints={{ deviceId: videoInputDevice.id }}
                    />
                  </div>
                )}
                <div className="noRoomTitleContainer">
                  <div className="noRoomTitle">você não está conectado</div>
                  {/* <div
                    onClick={() => enterRoom(getRandomId())}
                    className="noRoomCreateRoomButtom"
                  >
                    Criar Sala
                  </div> */}
                </div>
                <div className="roomButtonContainer">
                  {!currentRoomName && (
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
                        onClick={() => requestRandomRoom(true)}
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
                        onClick={() => enterRoom(getRandomId())}
                      >
                        <FiMapPin />
                        <div style={{ marginLeft: 10, marginRight: 10 }}>
                          Criar sala
                        </div>
                      </Fab>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="RoomContainer">
            {isRoomLoading ? (
              <div className="loadingContainer">
                <img src={launchAnimation} width="100%" alt="loading" />
                <div className="loadingTitleContainer">
                  <div className="loadingTitle">entrando na sala...</div>
                  <ScaleLoader height={18} color="#f50057" loading={true} />
                </div>
              </div>
            ) : (
              <div className="currentRoomNameContainer">
                {filmStripStatus && (
                  <Card className="currentRoomName">
                    <TextField
                      color="secondary"
                      value={currentRoomAlias}
                      label="você está em"
                      placeholder="nome da sala"
                      inputProps={{ min: 0, style: { textAlign: "icenter" } }}
                      onChange={(e) => setCurrentRoomAlias(e.target.value)}
                      onBlur={() =>
                        changeRoomName(
                          displayName,
                          currentRoomName,
                          currentRoomAlias
                        )
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <FiMapPin />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      style={{
                        height: 20,
                        width: "100%",
                        color: "white",
                        fontSize: 10,
                        marginTop: 10,
                        backgroundColor: "#25D365",
                      }}
                      startIcon={
                        <WhatsappShareButton
                          id="shareButton"
                          className="inviteShareButton"
                          url={`https://www.injoy.chat/?initialRoomName=${currentRoomName}`}
                        >
                          <WhatsappIcon size={20} round={true} />
                        </WhatsappShareButton>
                      }
                      onClick={() =>
                        document.getElementById("shareButton").click()
                      }
                    >
                      Convidar amigos
                    </Button>
                  </Card>
                )}
              </div>
            )}
            <div
              className={isRoomLoading ? "hiddenContainer" : "visibleContainer"}
            >
              {youtubeVideo && youtubeVideo.videoId && (
                <div className="youtubeVideoContainer">
                  <div className="youtubeVideoTopBar">
                    <div className="youtubeVideoTopBarTitle">
                      video compartilhado por {youtubeVideo.displayName}
                    </div>
                    <Fab
                      color="secondary"
                      size="small"
                      onClick={closeYoutubeVideo}
                    >
                      <FiX />
                    </Fab>
                  </div>
                  <iframe
                    width="100%"
                    allow="autoplay"
                    src={`https://www.youtube.com/embed/${youtubeVideo.videoId}?autoplay=1&autohide=1&showinfo=0&disablekb=1`}
                    id="youtubeVideoFrame"
                    title="youtube"
                    allowfullscreen
                    frameborder="0"
                  ></iframe>
                </div>
              )}
              <VideoFrameComponent
                mic={audioStatus}
                camera={videoStatus}
                roomName={currentRoomName}
                displayName={displayName}
                onRoomLeave={onRoomLeave}
                onRoomEntered={onRoomEntered}
                onAudioStatusChanged={onAudioStatusChanged}
                onVideoStatusChanged={onVideoStatusChanged}
                onTileviewStatusChanged={onTileviewStatusChanged}
                onFilmStripStatusChanged={onFilmStripStatusChanged}
                onShareScreenStatusChanged={onShareScreenStatusChanged}
                onDisplayNameChanged={onChangeDisplayName}
                videoInput={videoInputDevice.label}
                audioInput={audioInputDevice.label}
              />
            </div>
          </div>
        )}
        {messageInputStatus && (
          <div className="messageContainer">
            <TextField
              multiline
              autoFocus
              rows={2}
              rowsMax={4}
              value={message}
              color="secondary"
              variant="filled"
              placeholder="menssagem"
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                className: "sendMessageInput",
                endAdornment: (
                  <InputAdornment position="end">
                    <Fab
                      size="small"
                      color="secondary"
                      onClick={() => sendMessage(message)}
                      className="sendMessageButton"
                      edge="end"
                    >
                      <MdSend />
                    </Fab>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
      </div>
      <div className="controlPanelContainer">
        {!isRoomLoading && !isRandomRoomLoading && (
          <div
            className={currentRoomName ? "controlPanel" : "initialControlPanel"}
          >
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
            {currentRoomName && !isRoomLoading && (
              <Fab
                size="small"
                onClick={changeMessageInputStatus}
                className="controlPanelButton"
              >
                <FiMessageSquare
                  style={messageInputStatus && { color: "#f50057" }}
                />
              </Fab>
            )}
            {currentRoomName && !isRoomLoading && (
              <Fab
                size="small"
                onClick={changeTileviewStatus}
                className="controlPanelButton"
              >
                <FiGrid style={titleviewStatus && { color: "#f50057" }} />
              </Fab>
            )}
            {currentRoomName && !isRoomLoading && !isMobile && (
              <Fab
                size="small"
                className="controlPanelButton"
                onClick={changeShareScreenStatus}
              >
                <FiShare style={shareScreenStatus && { color: "#f50057" }} />
              </Fab>
            )}
            {currentRoomName && !isRoomLoading && (
              <Fab size="small" color="secondary" onClick={leaveRoom}>
                <FiPhoneMissed />
              </Fab>
            )}
          </div>
        )}
      </div>
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
