import React, { useState, useEffect } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./videoFrame.css";

const domain = "meet.jit.si";
const parentNode = "jitsiContainer";

export let videoApi;

export const VideoFrameComponent = ({ roomName, onLoad, camera, mic }) => {
  const [loading, setLoading] = useState(true);
  const displayName = localStorage.getItem("displayName");

  const onJoined = () => {
    setLoading(false);
    if (onLoad) onLoad();
    setTimeout(() => {
      const waterMark = document.getElementsByClassName("watermark")[0];
      if (waterMark) waterMark.style.display = "none";
    }, 1000);
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
        resolution: 240,
        disableDeepLinking: true,
        disableAudioLevels: true,
        enableTalkWhileMuted: false,
        disableRemoteMute: true,
        remoteVideoMenu: {
          disableKick: true,
          disableAudioLevel: true,
        },
        p2p: {
          enabled: true,
          stunServers: [{ urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" }],
        },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: true,
        JITSI_WATERMARK_LINK: " ",
        DEFAULT_BACKGROUND: "white",
        DEFAULT_LOCAL_DISPLAY_NAME: "você",
        DEFAULT_REMOTE_DISPLAY_NAME: null,
        VIDEO_QUALITY_LABEL_DISABLED: true,
        CONNECTION_INDICATOR_DISABLED: true,
        // TILE_VIEW_MAX_COLUMNS: 5,
        TOOLBAR_BUTTONS: [
          //"chat",
          //"camera",
          //"hangup",
          //"microphone",
          //"fullscreen",
          // "microphone",
          // "camera",
          // "closedcaptions",
          // "desktop",
          // "fullscreen",
          // "fodeviceselection",
          // "profile",
          // "chat",
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
          // "tileview",
          // "videobackgroundblur",
          // "download",
          // "help",
          // "mute-everyone",
          // "security",
        ],
      },
    };
    // eslint-disable-next-line no-undef
    videoApi = new JitsiMeetExternalAPI(domain, options);
    videoApi.addEventListener("videoConferenceJoined", onJoined);
    videoApi.executeCommand("avatarUrl", "./logo.png");
    if (!camera) videoApi.executeCommand("toggleVideo");
    if (!mic) videoApi.executeCommand("toggleAudio");

    videoApi.executeCommand("subject", " ");
  }, [roomName]);

  return (
    <div>
      {loading && (
        <div className="loadingContainer">
          <div className="loadingTitle">entrando em uma nova sala...</div>
          <div className="loadingAnimation">
            <PacmanLoader loading={loading} color="#424242" size="6vh" />
          </div>
        </div>
      )}
      <div
        id={parentNode}
        className={loading ? "hiddenContainer" : "visibleContainer"}
      />
    </div>
  );
};
