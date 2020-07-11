import React, { useState } from "react";
import { FiAtSign, FiMenu } from "react-icons/fi";
import {
  IconButton,
  TextField,
  InputAdornment,
  withStyles,
} from "@material-ui/core";

import "./topMenu.style.css";

const CssTextField = withStyles({
  root: {
    "& .MuiInput-underline:before, .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "unset",
    },
    "& .MuiInputBase-input": {
      textOverflow: "ellipsis",
    },
  },
})(TextField);

const TopMenuComponent = ({
  displayName,
  onDisplayNameChange,
  onMenuClick,
}) => {
  const [localDisplayName, setDisplayName] = useState(displayName);

  return (
    <div className="headerFirstLine">
      <div className="greetings">
        <CssTextField
          color="secondary"
          value={localDisplayName}
          placeholder="seu apelido"
          className="greetingsInput"
          textOverflow="ellipsis"
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => onDisplayNameChange(displayName)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiAtSign />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div>
        <IconButton onClick={onMenuClick}>
          <FiMenu />
        </IconButton>
      </div>
    </div>
  );
};

export default TopMenuComponent;
