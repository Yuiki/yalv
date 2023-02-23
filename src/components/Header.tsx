import { css } from "@emotion/react";
import { TextField, Grid, Button } from "@mui/material";
import { LevelState } from "./Main";
import { LevelSwitchers } from "./LevelSwitchers";
import { open } from "@tauri-apps/api/dialog";
import { Level } from "./backend";

export const Header = ({
  query,
  onQueryChanged,
  levelState,
  onLevelChecked,
  filePath,
  onFileSelected,
}: {
  query: string;
  onQueryChanged: (value: string) => unknown;
  levelState: LevelState;
  onLevelChecked: (level: Level, checked: boolean) => unknown;
  filePath: string | null;
  onFileSelected: (path: string) => unknown;
}) => {
  return (
    <div
      css={css({
        padding: "1rem",
      })}
    >
      <TextField
        spellCheck="false"
        fullWidth
        onChange={(ev) => {
          onQueryChanged(ev.target.value);
        }}
        label="Query"
        value={query}
        focused
        variant="filled"
        InputProps={{ disableUnderline: true }}
      />
      <LevelSwitchers
        levelState={levelState}
        onCheck={(level, checked) => {
          onLevelChecked(level, checked);
        }}
      />
      <Grid container justifyContent="space-between">
        <Grid item>
          <p>File: {filePath}</p>
        </Grid>
        <Grid item>
          <Button
            onClick={async () => {
              const file = await open();
              onFileSelected(file as string);
            }}
          >
            Select
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
