import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import { Fab } from "@material-ui/core";
import {
  FiPlay,
  // FiTarget,
  FiUsers,
  FiHash,
  // FiHeart,
  FiCrosshair,
  FiCoffee,
  FiActivity,
  // FiWind,
  FiCpu,
} from "react-icons/fi";
import "./chooseRoomPainel.style.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ChooseRoomPainelComponent = ({ opened, onRandomRoom, onClose }) => {
  const [locationFilter, setLocationFilter] = useState({
    label: "Pessoas perto",
    icon: <FiCrosshair />,
    isSelected: false,
    location: null,
  });

  const [filters, setFilters] = useState([
    {
      label: "Somente conhecidos",
      icon: <FiUsers />,
      isSelected: false,
    },
    {
      label: "Política",
      icon: <FiHash />,
      isSelected: false,
    },
    {
      label: "Saúde",
      icon: <FiActivity />,
      isSelected: false,
    },
    {
      label: "Tecnologia",
      icon: <FiCpu />,
      isSelected: false,
    },
    {
      label: "Zueira",
      icon: <FiCoffee />,
      isSelected: false,
    },
    // {
    //   label: "Humor",
    //   icon: <FiWind />,
    //   isSelected: false,
    // },
    // {
    //   label: "Namoro",
    //   icon: <FiHeart />,
    //   isSelected: false,
    // },
  ]);

  const onToggleTag = (label) => {
    const updatedFilters = [];
    for (let i = 0; i < filters.length; i++) {
      let updatedFilter = {
        label: filters[i].label,
        icon: filters[i].icon,
        isSelected:
          filters[i].label === label
            ? !filters[i].isSelected
            : filters[i].isSelected,
      };
      updatedFilters.push(updatedFilter);
    }

    setFilters(updatedFilters);
  };

  const onToggleLocation = () => {
    setLocationFilter((prevState) => {
      return { ...prevState, isSelected: !locationFilter.isSelected };
    });

    if (!locationFilter.isSelected)
      navigator.geolocation.getCurrentPosition(function success(location) {
        setLocationFilter((prevState) => {
          return { ...prevState, coords: location.coords };
        });
      });
  };

  const renderFilter = (label, icon, isSelected, onToggle) => (
    <Fab
      key={label}
      size="small"
      color="secondary"
      variant="extended"
      className={
        isSelected ? "filterTagSelectedContainer" : "filterTagContainer"
      }
      onClick={onToggle}
    >
      {icon}
      <div className="filterTagTitle">{label}</div>
    </Fab>
  );

  return (
    <Dialog
      open={opened}
      TransitionComponent={Transition}
      onClose={onClose}
      maxWidth={"xs"}
      keepMounted
    >
      <DialogTitle style={{ color: "#424242" }}>
        {" Adicione os filtros que quiser e busque sua sala. Boa Sorte!"}
      </DialogTitle>
      <DialogContent>
        {/* <DialogContentText id="alert-dialog-slide-description">
          Adicione os filtros que quiser e busque sua sala!
        </DialogContentText> */}
        <div>
          {renderFilter(
            locationFilter.label,
            locationFilter.icon,
            locationFilter.isSelected,
            () => onToggleLocation()
          )}
          {filters.map((filter) =>
            renderFilter(filter.label, filter.icon, filter.isSelected, () =>
              onToggleTag(filter.label)
            )
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <div className="findRoomButtonContainer">
          <Fab
            size="small"
            color="secondary"
            variant="extended"
            style={{ margin: 30 }}
            onClick={() => onRandomRoom()}
          >
            <FiPlay />
            <div style={{ marginLeft: 10, marginRight: 10 }}>Iniciar</div>
          </Fab>
        </div>
      </DialogActions>
    </Dialog>
  );
};
export default ChooseRoomPainelComponent;
