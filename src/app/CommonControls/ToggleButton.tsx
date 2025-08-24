import React from "react";

type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      style={{
        width: "50px",
        height: "25px",
        borderRadius: "25px",
        background: isOn ? "limegreen" : "lightgray",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.3s",
      }}
    >
      <div
        style={{
          width: "23px",
          height: "23px",
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: "1px",
          left: isOn ? "26px" : "1px",
          transition: "left 0.3s",
        }}
      />
    </div>
  );
};

export default ToggleSwitch;
