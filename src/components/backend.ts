import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";

export const levels = [
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
  "OTHER",
] as const;

export type Level = typeof levels[number];

export type LogEntry = {
  text: string;
  level: Level;
};

export const selectFile = (path: string) => {
  invoke("select_file", { path });
};

export const listenLogChanges = (cb: (entries: LogEntry[]) => unknown) => {
  return listen("LOG_CHANGES", (ev) => {
    cb(ev.payload as LogEntry[]);
  });
};
