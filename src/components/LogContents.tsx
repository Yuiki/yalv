import { css } from "@emotion/react";
import { memo, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { LogEntry, Level } from "./backend";

const getColor = (level: Level) => {
  switch (level) {
    case "ERROR":
      return "red";
    case "WARN":
      return "#400000";
    case "INFO":
      return "#000040";
    case "DEBUG":
      return "transparent";
    case "TRACE":
      return "#303030";
  }
};

export const LogContents = memo<{ entries: LogEntry[] }>(({ entries }) => {
  const itemContent = useCallback((_index: number, entry: LogEntry) => {
    return (
      <div
        css={css({
          backgroundColor: getColor(entry.level),
        })}
      >
        {entry.text}
      </div>
    );
  }, []);

  return (
    <pre
      css={css`
        white-space: pre-wrap;
        word-break: break-all;
        height: 100%;
        padding-left: 1rem;
        margin: 0;
      `}
    >
      <Virtuoso data={entries} itemContent={itemContent} />
    </pre>
  );
});
