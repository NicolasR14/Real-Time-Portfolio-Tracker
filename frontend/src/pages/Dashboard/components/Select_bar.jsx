import React from "react";
import Slider from "@mui/material/Slider";

export default function Select({ selFct }) {
  const containerStyle = {
    position: "relative",
    width: "3rem",
    height: "3rem",
  };

  // const useStyles = makeStyles((theme) => ({
  //   mark: {
  //     color: "red",
  //   },
  // }));

  const marks = [
    {
      value: 0,
      label: "$",
    },
    {
      value: 1,
      label: "€",
    },
    {
      value: 2,
      label: "ETH",
    },
    {
      value: 3,
      label: "BTC",
    },
    {
      value: 4,
      label: "***",
    },
  ];
  // const classes = useStyles();

  const handleChange = (event, newValue) => {
    selFct(newValue);
  };

  return (
    <Slider
      aria-label="Restricted values"
      defaultValue={"0"}
      step={null}
      marks={marks}
      min={0}
      max={4}
      track={false}
      sx={{
        color: "#0099ff",
      }}
      // classes={{ markLabel: classes.mark }}
      onChange={handleChange}
    />
  );
}
