import React, { useEffect } from "react";
import { isMobile } from "react-device-detect";

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
  onFilmStripStatusChanged,
  onShareScreenStatusChanged,
  onDisplayNameChanged,
}) => {
  useEffect(() => {
    if (videoApi) videoApi.dispose();

    const displayName = localStorage.getItem("displayName");
    const storedVideoInput = JSON.parse(localStorage.getItem("videoInput"));
    const storedAudioInput = JSON.parse(localStorage.getItem("audioInput"));
    const audioOutput = null;

    const options = {
      roomName: `rolê_${roomName}`,
      parentNode: document.getElementById(parentNode),
      userInfo: {
        displayName: displayName,
      },
      devices: {
        ...(storedVideoInput && { videoInput: storedVideoInput.label }),
        ...(storedAudioInput && { audioInput: storedAudioInput.label }),
        ...(audioOutput && { audioOutput }),
      },
      configOverwrite: {
        noSSL: true,
        resolution: 240,
        defaultLanguage: "en",
        prejoinPageEnabled: false,
        liveStreamingEnabled: true,
        enableClosePage: false,
        enableWelcomePage: false,
        disableDeepLinking: true,
        disableAudioLevels: true,
        enableTalkWhileMuted: false,
        enableNoAudioDetection: false,
        enableNoisyMicDetection: false,
        enableCalendarIntegration: false,
        enableInsecureRoomNameWarning: false,
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
        MOBILE_APP_PROMO: true,
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
        DISABLE_VIDEO_BACKGROUND: true,
        DEFAULT_BACKGROUND: "white",
        DEFAULT_LOCAL_DISPLAY_NAME: "",
        DEFAULT_REMOTE_DISPLAY_NAME: null,
        VIDEO_QUALITY_LABEL_DISABLED: true,
        CONNECTION_INDICATOR_DISABLED: true,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        SHOW_CHROME_EXTENSION_BANNER: false,
        HIDE_INVITE_MORE_HEADER: false,
        DISABLE_FOCUS_INDICATOR: true,
        TILE_VIEW_MAX_COLUMNS: isMobile ? 2 : 4,
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
      },
    };
    // eslint-disable-next-line no-undef
    videoApi = new JitsiMeetExternalAPI(domain, options);
    videoApi.addEventListeners({
      videoConferenceLeft: onRoomLeave,
      videoConferenceJoined: (payload) => onRoomEntered(payload.id),
      videoAvailabilityChanged: (payload) =>
        onVideoStatusChanged(payload.available),
      audioAvailabilityChanged: (payload) =>
        onAudioStatusChanged(payload.available),
      videoMuteStatusChanged: (payload) => onVideoStatusChanged(!payload.muted),
      audioMuteStatusChanged: (payload) => onAudioStatusChanged(!payload.muted),
      screenSharingStatusChanged: (payload) =>
        onShareScreenStatusChanged(payload.on),
      tileViewChanged: (payload) => onTileviewStatusChanged(payload.enabled),
      filmstripDisplayChanged: (payload) =>
        onFilmStripStatusChanged(payload.visible),
      displayNameChange: (payload) =>
        onDisplayNameChanged(payload.id, payload.displayname),
    });

    videoApi.executeCommand("subject", " ");
    if (!camera) videoApi.executeCommand("toggleVideo");
    if (!mic) videoApi.executeCommand("toggleAudio");
  }, [roomName]);

  return <div id={parentNode} style={{ height: "100%" }} />;
};
