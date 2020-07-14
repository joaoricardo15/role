import React, { useState } from "react";
import { TextField, withStyles, InputAdornment, Fab } from "@material-ui/core";
import { MdSend } from "react-icons/md";
import "./messagePainel.style.css";

const CssTextField = withStyles({
  root: {
    "& .MuiFilledInput-multiline": {
      width: 300,
      padding: 10,
      backgroundColor: "#fffffff0",
    },
  },
})(TextField);

const MessagePainelComponent = ({ message, onSendMessage }) => {
  const [localMessage, setMessage] = useState(message);

  return (
    <div className="messageContainer">
      <CssTextField
        multiline
        autoFocus
        rows={2}
        rowsMax={8}
        value={localMessage}
        color="secondary"
        variant="filled"
        placeholder="menssagem"
        onChange={(e) => setMessage(e.target.value)}
        InputProps={{
          className: "sendMessageInput",
          endAdornment: (
            <InputAdornment position="end">
              <Fab
                size="small"
                color="secondary"
                onClick={() => onSendMessage(localMessage)}
                className="sendMessageButton"
                edge="end"
              >
                <MdSend />
              </Fab>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default MessagePainelComponent;
