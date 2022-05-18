import React from "react";
import Slider from "@mui/material/Slider";
const containerStyle = {
  position: "relative",
  width: "3rem",
  height: "3rem",
};

export default function Select() {
  return <Slider aria-label="Restricted values" defaultValue={20} />;
}
