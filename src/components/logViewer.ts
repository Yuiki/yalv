import { UnlistenFn } from "@tauri-apps/api/event";
import { useState, useCallback, useEffect } from "react";
import {
  levels,
  LogEntry,
  Level,
  listenLogChanges,
  selectFile,
} from "./backend";
import { LevelState } from "./Main";

export const useLogViewer = () => {
  const defaultLevelState = levels.reduce(
    (acc, level) => ({
      ...acc,
      [level]: true,
    }),
    {} as LevelState
  );
  const [levelState, setLevelState] = useState<LevelState>(defaultLevelState);
  const [query, setQuery] = useState("");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [visibleLogEntries, setVisibleLogEntries] = useState<LogEntry[]>([]);
  const [filterTimeoutId, setFilterTimeoutId] = useState<number>(null);
  const [filePath, setFilePath] = useState<string>(null);

  const filterLogEntries = useCallback(() => {
    const entries = logEntries.filter((entry) => {
      if (query) {
        if (!entry.text.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      return levelState[entry.level];
    });

    setVisibleLogEntries(entries);
  }, [logEntries, query, levelState, setVisibleLogEntries]);

  useEffect(() => {
    if (filterTimeoutId) {
      clearTimeout(filterTimeoutId);
    }
    // throttling
    const id = setTimeout(() => {
      filterLogEntries();
    }, 300) as any as number;
    setFilterTimeoutId(id);
  }, [query]);

  useEffect(() => {
    if (filterTimeoutId) {
      clearTimeout(filterTimeoutId);
    }
    filterLogEntries();
  }, [logEntries, levelState]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    (async () => {
      unlisten = await listenLogChanges((entries) => {
        setLogEntries(entries);
      });
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (filePath) {
      selectFile(filePath);
    }
  }, [filePath]);

  const onLevelChecked = useCallback(
    (level: Level, checked: boolean) => {
      setLevelState({
        ...levelState,
        [level]: checked,
      });
    },
    [setLevelState, levelState]
  );

  return {
    query,
    setQuery,
    filePath,
    setFilePath,
    levelState,
    onLevelChecked,
    logEntries: visibleLogEntries,
  };
};
