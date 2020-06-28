import React, { useState, useEffect } from "react";
//import PacmanLoader from "react-spinners/PacmanLoader";
import luachAnimation from "./../../assets/launch.gif";
import "./videoFrame.css";

const domain = "meet.jit.si";
const parentNode = "jitsiContainer";

export let videoApi;

export const VideoFrameComponent = ({
  roomName,
  onRoomEnter,
  onRoomLeave,
  onShareScreen,
  camera,
  mic,
  onMuted,
}) => {
  const [loading, setLoading] = useState(true);
  const displayName = localStorage.getItem("displayName");

  const onJoined = () => {
    setLoading(false);
    if (onRoomEnter) onRoomEnter();

    // let iframe = document.querySelector("iframe");
    // const waterMark = iframe.getElementsByClassName("watermark")[0];
    // if (waterMark) waterMark.style.display = "none";
    //document.body.requestFullscreen();

    //const iframe = document.getElementById("jitsiConferenceFrame0");
    // const iframeDom = iframe.contentDocument || iframe.contentWindow.document;
    // const elmnt = iframeDom.getElementsByClassName("watermark")[0];
    // elmnt.style.display = "none";

    // var el = document.getElementById("iframeId").contentWindow.document;

    // setTimeout(() => {
    //   const waterMark = document.getElementsByClassName("watermark")[0];
    //   if (waterMark) waterMark.style.display = "none";
    // }, 1000);
  };

  useEffect(() => {
    if (!loading) setLoading(true);
    if (videoApi) videoApi.dispose();
    const options = {
      roomName: `rolê_${roomName}`,
      parentNode: document.querySelector(`#${parentNode}`),
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        subject: " ", // hide room name
        noSSL: true,
        resolution: 240,
        defaultLanguage: "en",
        enableClosePage: false,
        enableWelcomePage: false,
        disableDeepLinking: true,
        disableAudioLevels: true,
        enableTalkWhileMuted: false,
        enableNoAudioDetection: false,
        enableNoisyMicDetection: false,
        desktopSharingSources: true,
        //disableRemoteMute: true,
        remoteVideoMenu: {
          // disableKick: true,
        },
        p2p: {
          enabled: true,
        },
      },
      interfaceConfigOverwrite: {
        DEFAULT_BACKGROUND: "white",
        DEFAULT_LOCAL_DISPLAY_NAME: "você",
        DEFAULT_REMOTE_DISPLAY_NAME: null,
        VIDEO_QUALITY_LABEL_DISABLED: true,
        CONNECTION_INDICATOR_DISABLED: true,
        TILE_VIEW_MAX_COLUMNS: 2,
        TOOLBAR_BUTTONS: [
          //"chat",
          // "hangup",
          // "camera",
          // "microphone",
          // "tileview",
          // "fullscreen",
          // "closedcaptions",
          // "desktop",
          // "fullscreen",
          // "fodeviceselection",
          // "profile",
          // "recording",
          // "livestreaming",
          // "etherpad",
          // "sharedvideo",
          // "settings",
          // "raisehand",
          // "videoquality",
          // "filmstrip",
          // "invite",
          // "feedback",
          // "stats",
          // "shortcuts",
          // "videobackgroundblur",
          // "download",
          // "help",
          // "mute-everyone",
          // "security",
        ],
        JITSI_WATERMARK_LINK: " ",
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    };
    // eslint-disable-next-line no-undef
    videoApi = new JitsiMeetExternalAPI(domain, options);
    videoApi.addEventListener("videoConferenceJoined", onJoined);
    videoApi.addEventListener("videoConferenceLeft", onRoomLeave);

    videoApi.addEventListener("screenSharingStatusChanged", (payload) =>
      onShareScreen(payload.on)
    );
    videoApi.addEventListener("audioMuteStatusChanged", (payload) => {
      if (onMuted) onMuted(payload.muted);
    });
    videoApi.addEventListener("incomingMessage", (payload) => {
      alert("in: " + payload.message);
    });
    videoApi.addEventListener("outgoingMessage", (payload) => {
      alert("out: " + payload.message);
      videoApi.executeCommand("sendEndpointTextMessage", "", payload.message);
    });
    videoApi.executeCommand("avatarUrl", "./logo.png");
    if (!camera) videoApi.executeCommand("toggleVideo");
    if (!mic) videoApi.executeCommand("toggleAudio");
  }, [roomName]);

  return (
    <div>
      {loading && (
        <div className="loadingContainer">
          <img src={luachAnimation} width="100%" alt="loading" />
          <div className="loadingTitle">entrando na sala...</div>
          {/* <div className="loadingTitle">entrando no rolê...</div>
          <div className="loadingAnimation">
            <PacmanLoader loading={loading} color="#424242" size="6vh" />
          </div> */}
        </div>
      )}
      <div
        id={parentNode}
        className={loading ? "hiddenContainer" : "visibleContainer"}
      />
    </div>
  );
};
