import React, { useState, useEffect } from "react";
import ReactGA from "react-ga";
import { useLocation } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { w3cwebsocket } from "websocket";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
import DrawerMenu from "../../components/drawerMenu/drawerMenu";
import TopMenuComponent from "../../components/topMenu/topMenu";
import NoRoomPainelComponent from "../../components/noRoomPainel/noRoomPainel";
import LoadingPainelComponent from "../../components/loadingPainel/loadingPainel";
import ControlPainelComponent from "../../components/controlPainel/controlPainel";
import MessagePainelComponent from "../../components/messagePainel/messagePainel";
import YouTubePainelComponent from "../../components/youtubePainel/youtubePainel";
import CurrentRoomCardComponent from "../../components/currentRoomCard/currentRoomCard";
import OnlineRoomsListComponent from "../../components/onlineRoomsList/onlineRoomsList";
// import InstallCardComponent from "../../components/installCard/installCard";
import astronautHelmet from "./../../assets/astronautHelmet.png";
import randomRoomAnimation from "./../../assets/search.gif";
import launchAnimation from "./../../assets/launch.gif";
import "./main.css";

let websocketClient;
const serverUrl = "wss://18b0p3qzk7.execute-api.us-east-1.amazonaws.com/beta";

const MainPage = () => {
  const [videoInputDevice, setVideoInputDevice] = useState(null);
  const [audioInputDevice, setAudioInputDevice] = useState(null);
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [titleviewStatus, setTitleviewStatus] = useState(false);
  const [filmStripStatus, setFilmStripStatus] = useState(true);
  const [shareScreenStatus, setShareScreenStatus] = useState(false);
  const [messageInputStatus, setMessageInputStatus] = useState(false);
  const [drawerOpenStatus, setDrawerOpenStatus] = useState(false);
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

  const startServerConnection = () => {
    const updatedUserId = startUser();

    websocketClient = new w3cwebsocket(
      `${serverUrl}/?id=${updatedUserId}&displayName=${displayName}`
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

  const changeRoomAlias = (newRooName) => {
    if (websocketClient.readyState === websocketClient.OPEN) {
      websocketClient.send(
        JSON.stringify({
          action: "onRoomNameChange",
          data: {
            displayName: displayName,
            roomName: currentRoomName,
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
    startServerConnection();
  }, []);

  return (
    <StickyContainer>
      <DrawerMenu
        opened={drawerOpenStatus}
        onClose={() => toggleDrawer(false)}
        onVideoInputChange={setVideoInputDevice}
        onAudioInputChange={setAudioInputDevice}
      />
      <Sticky>
        {({ style }) => (
          <div className="header" style={style}>
            <TopMenuComponent
              displayName={displayName}
              onDisplayNameChange={changeDisplayName}
              onMenuClick={() => toggleDrawer(true)}
            />
          </div>
        )}
      </Sticky>
      <div className="videoContainer">
        {!currentRoomName ? (
          isRandomRoomLoading ? (
            <LoadingPainelComponent
              imageSource={randomRoomAnimation}
              onAction={() => requestRandomRoom(false)}
              onActionTitle={"Cancelar busca"}
            />
          ) : (
            <NoRoomPainelComponent
              imageSource={astronautHelmet}
              onNewRoom={() => enterRoom(getRandomId())}
              onRandomRoom={() => requestRandomRoom(true)}
              videoInputDeviceId={videoInputDevice && videoInputDevice.id}
              videoStatus={videoStatus}
            />
          )
        ) : (
          <div>
            {isRoomLoading && (
              <LoadingPainelComponent imageSource={launchAnimation} />
            )}
            <div
              className={isRoomLoading ? "hiddenContainer" : "visibleContainer"}
            >
              <div className="currentRoomNameContainer">
                <CurrentRoomCardComponent
                  roomName={currentRoomName}
                  roomAlias={currentRoomAlias}
                  onRoomAliasChange={changeRoomAlias}
                />
              </div>
              {youtubeVideo && youtubeVideo.videoId && (
                <YouTubePainelComponent
                  displayName={youtubeVideo.displayName}
                  videoId={youtubeVideo.videoId}
                  onClose={closeYoutubeVideo}
                />
              )}
              <VideoFrameComponent
                mic={audioStatus}
                camera={videoStatus}
                roomName={currentRoomName}
                onRoomLeave={onRoomLeave}
                onRoomEntered={onRoomEntered}
                onAudioStatusChanged={onAudioStatusChanged}
                onVideoStatusChanged={onVideoStatusChanged}
                onTileviewStatusChanged={onTileviewStatusChanged}
                onFilmStripStatusChanged={onFilmStripStatusChanged}
                onShareScreenStatusChanged={onShareScreenStatusChanged}
                onDisplayNameChanged={onChangeDisplayName}
              />
            </div>
          </div>
        )}
        {messageInputStatus && (
          <MessagePainelComponent
            message={message}
            onSendMessage={sendMessage}
          />
        )}
      </div>
      {!isRoomLoading && !isRandomRoomLoading && filmStripStatus && (
        <ControlPainelComponent
          currentRoomName={currentRoomName}
          videoStatus={videoStatus}
          audioStatus={audioStatus}
          messageInputStatus={messageInputStatus}
          titleviewStatus={titleviewStatus}
          shareScreenStatus={shareScreenStatus}
          onToggleVideo={() => setVideoStatus(!videoStatus)}
          onToggleAudio={() => setAudioStatus(!audioStatus)}
          onToggleMessage={() => setMessageInputStatus(!messageInputStatus)}
          onToggleHangup={leaveRoom}
        />
      )}
      {onlineRooms.length > 0 &&
        !(
          onlineRooms.length === 1 &&
          onlineRooms[0].roomName === currentRoomName
        ) && (
          <OnlineRoomsListComponent
            onlineRooms={onlineRooms}
            onRoomClick={enterRoom}
          />
        )}
    </StickyContainer>
  );
};

export default MainPage;
