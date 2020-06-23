import React from "react";
import ReactGA from "react-ga";
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from "./pages/main/main";
import "./app.css";

const App = () => {
  ReactGA.initialize("237052717");

  return (
    <Router>
      <Route path="/:initialRoomName?" component={MainPage}></Route>
    </Router>
  );
};

export default App;
