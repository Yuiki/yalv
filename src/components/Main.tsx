import { Stack } from "@mui/material";
import { css } from "@emotion/react";
import { LogContents } from "./LogContents";
import { Header } from "./Header";
import { Level } from "./backend";
import { useLogViewer } from "./logViewer";

export type LevelState = {
  [l in Level]: boolean;
};

export const Main = () => {
  const {
    query,
    setQuery,
    filePath,
    setFilePath,
    levelState,
    onLevelChecked,
    logEntries,
  } = useLogViewer();

  return (
    <Stack css={css({ height: "100vh" })}>
      <Header
        query={query}
        onQueryChanged={setQuery}
        filePath={filePath}
        onFileSelected={setFilePath}
        levelState={levelState}
        onLevelChecked={onLevelChecked}
      />
      <LogContents entries={logEntries} />
    </Stack>
  );
};
