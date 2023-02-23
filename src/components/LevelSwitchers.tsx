import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { Level, levels } from "./backend";
import { LevelState } from "./Main";

export const LevelSwitchers = ({
  levelState,
  onCheck,
}: {
  levelState: LevelState;
  onCheck: (level: Level, checked: boolean) => unknown;
}) => {
  return (
    <FormGroup row>
      {levels.map((level) => {
        return (
          <FormControlLabel
            key={level}
            control={
              <Checkbox
                checked={levelState[level]}
                onChange={(ev) => {
                  onCheck(level, ev.target.checked);
                }}
              />
            }
            label={level}
          />
        );
      })}
    </FormGroup>
  );
};
