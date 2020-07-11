import React from "react";
import { Fab } from "@material-ui/core";
import { FiX } from "react-icons/fi";
import "./youtubePainel.style.css";

const YouTubePainelComponent = ({ displayName, videoId, onClose }) => {
  return (
    <div className="youtubeVideoContainer">
      <div className="youtubeVideoTopBar">
        <div className="youtubeVideoTopBarTitle">
          video compartilhado por {displayName}
        </div>
        <Fab color="secondary" size="small" onClick={onClose}>
          <FiX />
        </Fab>
      </div>
      <iframe
        width="100%"
        allow="autoplay"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&autohide=1&showinfo=0&disablekb=1`}
        id="youtubeVideoFrame"
        title="youtube"
        allowfullscreen
        frameborder="0"
      ></iframe>
    </div>
  );
};

export default YouTubePainelComponent;
