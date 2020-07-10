import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItem,
  ListItemText,
  MenuItem,
  Menu,
} from "@material-ui/core";
import { FiMic, FiVideo, FiCheck, FiInfo } from "react-icons/fi";
import { videoApi } from "./../../components/videoFrame/videoFrame";

const DrawerMenu = ({
  opened,
  onClose,
  onVideoInputChange,
  onAudioInputChange,
}) => {
  const [devices, setDevices] = useState({});
  const [videoInputDevice, setVideoInputDevice] = useState(null);
  const [audioInputDevice, setAudioInputDevice] = useState(null);
  const [videoMenuOpenStatus, setVideoMenuOpenStatus] = useState(null);
  const [audioMenuOpenStatus, setAudioMenuOpenStatus] = useState(null);

  const changeVideoInput = (videoInput) => {
    alert(JSON.stringify(videoInput));
    setVideoInputDevice(videoInput);
    localStorage.setItem("videoInput", JSON.stringify(videoInput));
    onVideoInputChange(videoInput);
  };

  const changeAudioInput = (audioInput) => {
    alert(JSON.stringify(audioInput));
    setAudioInputDevice(audioInput);
    localStorage.setItem("audioInput", JSON.stringify(audioInput));
    onAudioInputChange(audioInput);
  };

  const updateMediaDevices = () => {
    return new Promise((resolve, reject) => {
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
          const updatedMedias = { videoInputDevices, audioInputDevices };
          setDevices(updatedMedias);
          resolve(updatedMedias);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  const startDefaultMedia = () => {
    updateMediaDevices().then((updatedMedias) => {
      const storedVideoInput = JSON.parse(localStorage.getItem("videoInput"));
      if (
        storedVideoInput &&
        updatedMedias.videoInputDevices.findIndex(
          (x) => x.id === storedVideoInput.id
        ) > -1
      )
        changeVideoInput(storedVideoInput);
      else changeVideoInput(updatedMedias.videoInputDevices[0]);

      const storedAudioInput = JSON.parse(localStorage.getItem("audioInput"));
      if (
        storedAudioInput &&
        updatedMedias.audioInputDevices.findIndex(
          (x) => x.id === storedAudioInput.id
        ) > -1
      )
        changeAudioInput(storedAudioInput);
      else changeAudioInput(updatedMedias.audioInputDevices[0]);
    });
  };

  useEffect(() => {
    if (opened) {
      updateMediaDevices();
    }
  }, [opened]);

  useEffect(() => {
    startDefaultMedia();
  }, []);

  return (
    <Drawer anchor={"right"} open={opened} onClose={onClose}>
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
                      changeVideoInput({
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
                      changeAudioInput({
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
  );
};

export default DrawerMenu;
