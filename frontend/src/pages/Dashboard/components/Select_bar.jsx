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

export default function Select({ selFct, values }) {
  const handleChange = (event, newValue) => {
    selFct(newValue);
    setAlignment(newValue);
  };
  const [alignment, setAlignment] = React.useState(values[0].value);
  return (
    <ThemeProvider theme={theme}>
      <ToggleButtonGroup
        fullWidth
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
      >
        {values.map((v) => {
          return (
            <ToggleButton value={v.value} style={style}>
              {v.value2}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </ThemeProvider>
  );
}
