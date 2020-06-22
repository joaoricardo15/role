import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  SwipeableList,
  SwipeableListItem,
} from "@sandstreamdev/react-swipeable-list";
import {
  videoApi,
  VideoFrameComponent,
} from "./../../components/videoFrame/videoFrame";
import { RecentRoomComponent } from "./../../components/recentRoom/recentRoom";
import "./main.css";

const MainPage = () => {
  const initialRoomName = new URLSearchParams(useLocation().search).get(
    "initialRoomName"
  );
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName")
  );
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [recentRooms, setRecentRooms] = useState(
    JSON.parse(localStorage.getItem("recentRooms"))
  );

  const onNameChange = (name) => {
    localStorage.setItem("displayName", name);
    setDisplayName(name);
    if (videoApi) videoApi.executeCommand("displayName", name);
  };

  const onCreateRoom = () => {
    if (newRoomName) openRoom(newRoomName);
    setNewRoomName("");
  };

  const deleteFromRecentRooms = (roomName) => {
    const updatetRecentRooms = recentRooms.filter((x) => x !== roomName);
    setRecentRooms(updatetRecentRooms);
    localStorage.setItem("recentRooms", JSON.stringify(updatetRecentRooms));
  };

  const openRoom = (roomName) => {
    setLoading(true);
    setRoomName(`${roomName}`);
    updateRecentRooms(roomName);
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

  const onLoadRoom = () => {
    setLoading(false);
  };

  const onCloseRoom = () => {
    setRoomName(null);
  };

  useEffect(() => {
    if (initialRoomName) openRoom(initialRoomName);
  }, []);

  return (
    <div>
      <div className="header">
        <div className="greetings">
          <div className="greetingsTitle">Olá</div>
          <form className="nameForm">
            <input
              className="nameInput"
              value={displayName}
              placeholder="Digite seu apelido"
              onChange={(e) => onNameChange(e.target.value)}
            />
          </form>
        </div>
        {roomName && !loading && (
          <div>
            <div className="actualRoomTitle">você está em </div>
            <div className="actualRoom">
              <RecentRoomComponent roomName={roomName} />
            </div>
          </div>
        )}
        <div className="createRoomForm">
          <input
            value={newRoomName}
            className="createRoomInput"
            placeholder="Nome do rolê"
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button onClick={onCreateRoom} disabled={!newRoomName}>
            Criar rolê
          </button>
        </div>
      </div>
      {roomName && (
        <VideoFrameComponent
          roomName={roomName}
          onClose={onCloseRoom}
          onLoad={onLoadRoom}
        />
      )}
      <div className="recentRoomsList">
        {recentRooms &&
          recentRooms.length > 0 &&
          recentRooms.map(
            (recentRoomName, index) =>
              !(roomName && index === 0) && (
                <div className="recentRoom" key={recentRoomName}>
                  <RecentRoomComponent
                    roomName={recentRoomName}
                    onClick={() => openRoom(recentRoomName)}
                  />
                  <button onClick={() => deleteFromRecentRooms(recentRoomName)}>
                    Deletar
                  </button>
                </div>
              )
            // <SwipeableList>
            //   {recentRooms.map(
            //     (recentRoomName, index) =>
            //       !(roomName && index === 0) && (
            //         <SwipeableListItem
            //           swipeLeft={{
            //             content: <div></div>,
            //             action: () => deleteFromRecentRooms(recentRoomName),
            //           }}
            //         >
            //           <div className="recentRoom">
            //             <RecentRoomComponent
            //               roomName={recentRoomName}
            //               onClick={() => openRoon(recentRoomName)}
            //             />
            //           </div>
            //         </SwipeableListItem>
            //       )
            //   )}
            // </SwipeableList>
          )}
      </div>
    </div>
  );
};

export default MainPage;
