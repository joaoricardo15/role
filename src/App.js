import React from "react";
import "./App.css";

function App() {
  return (
    <div className="videoFrame">
      <iframe
        title="videoFrame"
        src="https://meet.jit.si/rolê"
        allow="camera;microphone"
        allowfullscreen
        frameborder="0"
        height="100%"
        width="100%"
        sandbox
      />
    </div>
  );
}

export default App;
