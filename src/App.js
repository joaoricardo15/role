import React, { useState } from "react";
import VideoFrameComponent from "./components/videoFrame/videoFrame";

const App = () => {
  const [roomName, setRoom] = useState("rolê");
  const [displayName, setName] = useState("herói");
  const [call, setCall] = useState(false);

  const handleClick = (event) => {
    event.preventDefault();
    if (roomName && displayName) setCall(true);
  };

  return (
    <div className="container">
      {/* <form>
        <input
          id="room"
          type="text"
          placeholder="Room"
          value={roomName}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input

          id="name"
          type="text"
          placeholder="Name"
          value={displayName}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleClick} type="submit">
          Start / Join
        </button>
      </form> */}
      <VideoFrameComponent roomName={roomName} displayName={displayName} />
    </div>
  );
};

export default App;
