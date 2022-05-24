import React from "react";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: blue[500],
    },
  },
});
const style = {
  fontSize: "80%",
  fontFamily: "system-ui, regular",
};

export default function Select({ selFct }) {
  const handleChange = (event, newValue) => {
    selFct(newValue);
    setAlignment(newValue);
  };
  const [alignment, setAlignment] = React.useState("usd");
  return (
    <ThemeProvider theme={theme}>
      <ToggleButtonGroup
        fullWidth
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton value="usd" style={style}>
          $
        </ToggleButton>
        <ToggleButton value="eur" style={style}>
          €
        </ToggleButton>
        <ToggleButton value="eth" style={style}>
          ETH
        </ToggleButton>
        <ToggleButton value="btc" style={style}>
          BTC
        </ToggleButton>
        <ToggleButton value="***" style={style}>
          ***
        </ToggleButton>
      </ToggleButtonGroup>
    </ThemeProvider>
  );
}
