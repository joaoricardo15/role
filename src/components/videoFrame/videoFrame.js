import React, { useState, useEffect } from "react";
import luachAnimation from "./../../assets/launch.gif";
import "./videoFrame.css";

const domain = "meet.jit.si";
const parentNode = "jitsiContainer";

export let videoApi;

export const VideoFrameComponent = ({
  mic,
  camera,
  roomName,
  onRoomLeave,
  onRoomEntered,
  onAudioStatusChanged,
  onVideoStatusChanged,
  onTileviewStatusChanged,
  onShareScreenStatusChanged,
}) => {
  const [loading, setLoading] = useState(true);
  const displayName = localStorage.getItem("displayName");

  const onRoomEnter = () => {
    setLoading(false);
    onRoomEntered();
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
        enableCalendarIntegration: false,
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
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        DISABLE_FOCUS_INDICATOR: true,
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
    videoApi.addEventListeners({
      videoConferenceJoined: onRoomEnter,
      videoConferenceLeft: onRoomLeave,
      videoAvailabilityChanged: (payload) =>
        onVideoStatusChanged(payload.available),
      audioAvailabilityChanged: (payload) =>
        onAudioStatusChanged(payload.available),
      videoMuteStatusChanged: (payload) => onVideoStatusChanged(!payload.muted),
      audioMuteStatusChanged: (payload) => onAudioStatusChanged(!payload.muted),
      screenSharingStatusChanged: (payload) =>
        onShareScreenStatusChanged(payload.on),
      tileViewChanged: (payload) => onTileviewStatusChanged(payload.enabled),
    });

    if (!camera) videoApi.executeCommand("toggleVideo");
    if (!mic) videoApi.executeCommand("toggleAudio");
  }, [roomName]);

  return (
    <div>
      {loading && (
        <div className="loadingContainer">
          <img src={luachAnimation} width="100%" alt="loading" />
          <div className="loadingTitle">entrando na sala...</div>
        </div>
      )}
      <div
        id={parentNode}
        className={loading ? "hiddenContainer" : "visibleContainer"}
      />
    </div>
  );
};
