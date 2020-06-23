import React from "react";
import "./textComponent.css";

const TextComponent = ({ children }) => {
  return <div className="container">{children}</div>;
};

export default TextComponent;
