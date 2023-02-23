import { css, Global } from "@emotion/react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Main } from "../components/Main";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      {process.env.NODE_ENV === "development" && (
        <script src="http://localhost:8097"></script>
      )}
      <Global
        styles={css`
          :root {
            font-size: 14px;
          }
        `}
      />
      <CssBaseline />
      <Main />
    </ThemeProvider>
  );
};

export default App;
