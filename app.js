import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from "./pages/main/main";
import "./app.css";

const App = () => {
  return (
    <Router>
      <Route path="/:initialRoomName?" component={MainPage}></Route>
    </Router>
  );
};

export default App;
