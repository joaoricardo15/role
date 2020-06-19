import React, { useEffect } from "react";
import "./videoFrame.css";

const VideoFrameComponent = ({ roomName, displayName }) => {
  let jitsiApi;
  const parentNode = "jitsiContainer";
  const onLoad = () => {};

  const hangUp = () => {
    jitsiApi.executeCommand("hangup");
  };

  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      onLoad,
      roomName,
      // width: "100%",
      // height: "100%",
      parentNode: document.querySelector(`#${parentNode}`),
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        enableNoAudioDetection: false,
        enableNoisyMicDetection: false,
        startWithAudioMuted: true,
        resolution: 240,
      },
      interfaceConfigOverwrite: {
        DEFAULT_BACKGROUND: "white",
        DISABLE_VIDEO_BACKGROUND: true,
        DEFAULT_LOCAL_DISPLAY_NAME: "você",
        DEFAULT_REMOTE_DISPLAY_NAME: null,
        SHOW_JITSI_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          //   "closedcaptions",
          //   "desktop",
          "fullscreen",
          //   "fodeviceselection",
          //   "hangup",
          //   "profile",
          "chat",
          //   "recording",
          //   "livestreaming",
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
          // "e2ee",
          // "security",
        ],
        // filmStripOnly: true,
        VIDEO_QUALITY_LABEL_DISABLED: true,
        CONNECTION_INDICATOR_DISABLED: true,
        //VERTICAL_FILMSTRIP: true,
      },
    };
    // eslint-disable-next-line no-undef
    jitsiApi = new JitsiMeetExternalAPI(domain, options);
    jitsiApi.executeCommand("toggleTileView");
  }, [roomName]);

  return <div id={parentNode} className="jitsiContainer" />;
};

export default VideoFrameComponent;
