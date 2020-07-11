import React from "react";
import { Card } from "@material-ui/core";

const OnlineRoomsListComponent = ({ onlineRooms, onRoomClick }) => {
  return (
    <div className="onlineRoomsListContainer">
      <div className="onlineRoomsListTitleContainer">
        <img
          className="onlineRoomsListIcon"
          src={process.env.PUBLIC_URL + "logo.png"}
          width="30"
          alt="loading"
        />
        <div className="onlineRoomsListTitle"> salas online </div>
      </div>
      <div className="onlineRoomsList">
        {onlineRooms.map((onlineRoom) => (
          <Card style={{ marginTop: 10 }}>
            <div
              className="onlineRoom"
              onClick={() => onRoomClick(onlineRoom.roomName)}
            >
              <div className="onlineRoomNameContainer">
                <div className="onlineRoomName">
                  {onlineRoom.roomAlias || "sala sem nome"}
                </div>
              </div>
              <div className="onlineRoomUsersList">
                {onlineRoom.users.map((onlineUser, index) => (
                  <div className="onlineRoomUserName">
                    {`${index === 0 ? "" : ", "}@${
                      onlineUser.displayName || "sem nome"
                    }`}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OnlineRoomsListComponent;
