import React, { useState, useEffect } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./videoFrame.css";

const domain = "meet.jit.si";
const parentNode = "jitsiContainer";

export let videoApi;

export const VideoFrameComponent = ({ roomName, onClose, onLoad }) => {
  const [loading, setLoading] = useState(true);
  const displayName = localStorage.getItem("displayName");

  const hangUp = () => {
    if (videoApi) videoApi.dispose();
    if (onClose) onClose();
  };

  const onJoined = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  useEffect(() => {
    if (!loading) setLoading(true);
    //if (videoApi) videoApi.dispose();
    const options = {
      roomName,
      parentNode: document.querySelector(`#${parentNode}`),
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        resolution: 240,
        disableDeepLinking: true,
        disableAudioLevels: true,
        startWithAudioMuted: true,
        enableTalkWhileMuted: false,
        disableRemoteMute: true,
        remoteVideoMenu: {
          disableKick: true,
        },
        p2p: {
          enabled: true,
          stunServers: [{ urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" }],
        },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: true,
        DEFAULT_LOGO_URL: "../images/watermark.png",
        JITSI_WATERMARK_LINK: " ",
        DEFAULT_BACKGROUND: "white",
        DEFAULT_LOCAL_DISPLAY_NAME: "você",
        DEFAULT_REMOTE_DISPLAY_NAME: null,
        VIDEO_QUALITY_LABEL_DISABLED: true,
        TOOLBAR_BUTTONS: [
          // "chat",
          // "camera",
          // "hangup",
          // "microphone",
          // "fullscreen",
          // "sharedvideo",
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "profile",
          "chat",
          "recording",
          "livestreaming",
          "etherpad",
          "sharedvideo",
          "settings",
          "raisehand",
          "videoquality",
          "filmstrip",
          "invite",
          "feedback",
          "stats",
          "shortcuts",
          "tileview",
          "videobackgroundblur",
          "download",
          "help",
          "mute-everyone",
          "security",
        ],
      },
    };
    // eslint-disable-next-line no-undef
    videoApi = new JitsiMeetExternalAPI(domain, options);
    videoApi.addEventListener("videoConferenceJoined", onJoined);
    videoApi.addEventListener("readyToClose", hangUp);
    videoApi.executeCommand("toggleFilmStrip");

    videoApi.executeCommand("subject", " ");
  }, [roomName]);

  return (
    <div>
      <PacmanLoader
        loading={loading}
        color="#424242"
        size="6vh"
        css="height: 60vh; margin-left: 20px;"
      />
      <div
        id={parentNode}
        className={loading ? "hiddenContainer" : "visibleContainer"}
      />
    </div>
  );
};
