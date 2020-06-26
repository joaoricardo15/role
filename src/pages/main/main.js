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
} from "@material-ui/core";
import { w3cwebsocket } from "websocket";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
import ShareCardComponent from "../../components/shareCard/shareCard";
import InstallCardComponent from "../../components/installCard/installCard";
import noVideoAnimation from "./../../assets/astronaut.gif";
import "./main.css";

let websocketClient;
const serverUrl = "ws://localhost:1000";

const MainPage = () => {
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [shareScreen, setShareScreen] = useState(false);
  const [roomName, setRoomName] = useState(null);
  const [onlineRooms, setOnlineRooms] = useState([]);
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

  const openRoom = (roomName) => {
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

  const updateMyStatusOnServer = (displayName, roomName) => {
    // if (websocketClient.readyState === websocketClient.OPEN) {
    //   websocketClient.send(
    //     JSON.stringify({
    //       id: localStorage.getItem("userId"),
    //       displayName: displayName,
    //       roomName: roomName,
    //     })
    //   );
    // }
  };

  const onRoomEnter = () => {
    updateMyStatusOnServer(displayName, roomName);
  };

  const onRoomLeave = () => {
    updateMyStatusOnServer(displayName, null);
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

  const startServerConnection = () => {
    websocketClient = new w3cwebsocket(
      `${serverUrl}/user/?id=${localStorage.getItem(
        "userId"
      )}&displayName=${displayName}&roomName=${initialRoomName}`
    );

    websocketClient.onopen = () => {
      websocketClient.onmessage = (message) => {
        setOnlineRooms(JSON.parse(message.data));
      };
    };
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
    if (initialRoomName) openRoom(initialRoomName);
    const userId = localStorage.getItem("userId");
    if (!userId) localStorage.setItem("userId", getRandomId());
    //startServerConnection();
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
            </div>
          </div>
        )}
      </Sticky>
      <div className="videoContainer">
        {!roomName ? (
          <div className="noRoomContainer">
            {camera ? (
              <div className="noRoomCamera">
                <Webcam audio={true} width="100%" height="100%" mirrored />
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
              você ainda não está conectado
            </div>
          </div>
        ) : (
          <VideoFrameComponent
            roomName={roomName}
            onMuted={onMuted}
            onRoomEnter={onRoomEnter}
            onRoomLeave={onRoomLeave}
            onShareScreen={onShareScreen}
            camera={camera}
            mic={mic}
          />
        )}
      </div>
      <div className="roomButtonContainer">
        {!roomName ? (
          <Button
            color="secondary"
            variant="contained"
            startIcon={<FiPlayCircle />}
            onClick={() => openRoom(getRandomId())}
          >
            Criar sala
          </Button>
        ) : (
          <Button
            variant="contained"
            style={{ backgroundColor: "white" }}
            startIcon={
              <WhatsappShareButton
                id="shareButton"
                className="inviteShareButton"
                url={`https://www.injoy.chat/?initialRoomName=${roomName}`}
              >
                <WhatsappIcon size={24} round={true} />
              </WhatsappShareButton>
            }
            onClick={() => document.getElementById("shareButton").click()}
          >
            Enviar convite
          </Button>
        )}
      </div>
      <ButtonGroup style={{ width: "100%", justifyContent: "center" }}>
        <IconButton onClick={toggleCamera}>
          {camera ? <FiVideo /> : <FiVideoOff />}
        </IconButton>
        <IconButton onClick={toggleMic}>
          {mic ? <FiMic /> : <FiMicOff />}
        </IconButton>
        <IconButton size="small" onClick={toggleViewMode} disabled={!roomName}>
          <FiGrid />
        </IconButton>
        {/* <IconButton size="small" onClick={toggleChat} disabled={!roomName}>
          <FiMessageSquare />
        </IconButton> */}
        {!isMobile && (
          <IconButton
            size="small"
            color={shareScreen && "secondary"}
            onClick={toggleShateScreen}
            disabled={!roomName}
          >
            <FiShare />
          </IconButton>
        )}
        <IconButton
          size="small"
          color="secondary"
          onClick={hangUp}
          disabled={!roomName}
        >
          <FiPhoneMissed />
        </IconButton>
      </ButtonGroup>
      {onlineRooms.length > 0 && !(roomName && onlineRooms.length === 1) && (
        <div className="recentRoomsListContainer">
          <div> salas disponíveis </div>
          <div className="recentRoomsList">
            {onlineRooms.map((onlineRoom) => (
              <div className="recentRoom">
                <ShareCardComponent
                  title={`sala com ${JSON.stringify(onlineRoom.users)}`}
                  onClick={() => openRoom(onlineRoom.roomName)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <InstallCardComponent />
    </StickyContainer>
  );
};

export default MainPage;
