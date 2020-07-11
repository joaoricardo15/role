import React, { useState } from "react";
import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { Card, TextField, Button, InputAdornment } from "@material-ui/core";
import { FiMapPin } from "react-icons/fi";
import "./currentRoomCard.style.css";

const CurrentRoomCardComponent = ({
  roomName,
  roomAlias,
  onRoomAliasChange,
}) => {
  const [currentRoomAlias, setCurrentRoomAlias] = useState(roomAlias);

  return (
    <Card className="currentRoomNameContainer">
      <TextField
        color="secondary"
        value={currentRoomAlias}
        label="você está em"
        placeholder="nome da sala"
        inputProps={{ min: 0, style: { textAlign: "icenter" } }}
        onChange={(e) => setCurrentRoomAlias(e.target.value)}
        onBlur={() => onRoomAliasChange(currentRoomAlias)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <FiMapPin />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button
        size="small"
        variant="contained"
        style={{
          height: 20,
          width: "100%",
          color: "white",
          fontSize: 10,
          marginTop: 10,
          backgroundColor: "#25D365",
        }}
        startIcon={
          <WhatsappShareButton
            id="shareButton"
            className="inviteShareButton"
            url={`https://www.injoy.chat/?initialRoomName=${roomName}`}
          >
            <WhatsappIcon size={20} round={true} />
          </WhatsappShareButton>
        }
        onClick={() => document.getElementById("shareButton").click()}
      >
        Convidar amigos
      </Button>
    </Card>
  );
};

export default CurrentRoomCardComponent;
