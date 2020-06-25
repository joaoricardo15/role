import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneMissed,
  FiGrid,
  FiMessageSquare,
  FiPlayCircle,
  FiAtSign,
} from "react-icons/fi";
import {
  IconButton,
  TextField,
  InputAdornment,
  ButtonGroup,
  Button,
} from "@material-ui/core";
//import Axios from "axios";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
//import ShareCardComponent from "../../components/shareCard/shareCard";
import InstallCardComponent from "../../components/installCard/installCard";
import "./main.css";

// const serverUserEndpoint = "http://localhost:1000/user";
// const serverRoomEndpoint = "http://localhost:1000/rooms";

const MainPage = () => {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(true);
  const [viewMode, setViewMode] = useState(true);
  const [roomName, setRoomName] = useState(null);

  // const [loading, setLoading] = useState(false);
  // const [newRoomName, setNewRoomName] = useState("");
  //const [onlineRooms, setOnlineRooms] = useState([]);
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

  // const deleteFromRecentRooms = (roomName) => {
  //   const updatetRecentRooms = recentRooms.filter((x) => x !== roomName);
  //   setRecentRooms(updatetRecentRooms);
  //   localStorage.setItem("recentRooms", JSON.stringify(updatetRecentRooms));
  // };

  const openRoom = (roomName) => {
    // setLoading(true);
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

  // const getUsersStatusOnServer = () => {
  //   Axios.get(serverRoomEndpoint).then((response) =>
  //     setOnlineRooms(response.data)
  //   );
  // };

  // const updateMyStatusOnServer = () => {
  //   Axios.post(serverUserEndpoint, {
  //     id: localStorage.getItem("userId"),
  //     displayName: displayName,
  //     roomName: roomName,
  //   });
  // };

  const onRoomEnter = () => {
    //updateMyStatusOnServer();
  };

  const onRoomLeave = () => {
    //updateMyStatusOnServer();
  };

  const hangUp = () => {
    setRoomName(null);
    if (videoApi) videoApi.dispose();
    onRoomLeave();
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
    setViewMode(!viewMode);
    if (videoApi) videoApi.executeCommand("toggleTileView");
  };

  const toggleChat = () => {
    if (videoApi) videoApi.executeCommand("toggleChat");
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
    // getUsersStatusOnServer();
    // setInterval(() => getUsersStatusOnServer(), 10000);
    // window.addEventListener("beforeunload", onRoomLeave());
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
            {/* {!loading && !roomName && (
              <div className="newRoomContainer">
                <Chip
                    clickable
                    color="primary"
                    label="Rolê aleatório"
                    onClick={() => openRoom(getRandomRoom())}
                    deleteIcon={<FiPlayCircle />}
                    onDelete={null}
                    variant="outlined"
                  />
                <div className="createRoomContainer">
                  <TextField
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
            )} */}
          </div>
        )}
      </Sticky>
      <div className="videoContainer">
        {!roomName ? (
          camera ? (
            <Webcam audio={false} height="100%" width="100%" mirrored />
          ) : (
            <div className="noVideoContainer">
              <img
                className="noVideoImage"
                src={process.env.PUBLIC_URL + "/logo.png"}
                width="80%"
                alt="logo"
              />
              <div className="noVideoTitle">câmera desligada</div>
            </div>
          )
        ) : (
          <VideoFrameComponent
            roomName={roomName}
            onMuted={onMuted}
            onRoomEnter={onRoomEnter}
            onRoomLeave={onRoomLeave}
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
            color="blue"
            startIcon={
              <WhatsappShareButton
                id="shareButton"
                className="inviteButton"
                url={`https://injoy.chat/?initialRoomName=${roomName}`}
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
        <IconButton size="small" onClick={toggleChat} disabled={!roomName}>
          <FiMessageSquare />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          onClick={hangUp}
          disabled={!roomName}
        >
          <FiPhoneMissed />
        </IconButton>
      </ButtonGroup>
      {/* {onlineRooms.length > 0 && (
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
      )} */}
      {/* {recentRooms && recentRooms.length > 0 && (
        <div className="recentRoomsListContainer">
          <div>últimos rolês visitados</div>
          <div className="recentRoomsList">
            {recentRooms.map((recentRoomName, index) => (
              <div className="recentRoom">
                <ShareCardComponent
                  roomName={recentRoomName}
                  onClick={() => openRoom(recentRoomName)}
                  onSwipe={() => deleteFromRecentRooms(recentRoomName)}
                />
              </div>
            ))}
          </div>
        </div>
      )} */}
      <InstallCardComponent />
    </StickyContainer>
  );
};

export default MainPage;
