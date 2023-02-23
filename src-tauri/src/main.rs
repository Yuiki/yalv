#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
    time::Duration,
};
use tauri::Manager;

#[derive(Clone, Serialize)]
struct LogEntry {
    text: String,
    level: String,
}

struct AppState {
    path: Mutex<Option<PathBuf>>,
    debouncer: Mutex<notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>,
}

static LEVELS: &'static [&str] = &["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Notify(#[from] notify::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
fn select_file(path: String, app_handle: tauri::AppHandle) -> Result<(), Error> {
    println!("{} selected", path);

    let state = app_handle.state::<AppState>();
    let mut debouncer = state.debouncer.lock().unwrap();

    if let Some(path) = &*state.path.lock().unwrap() {
        debouncer.watcher().unwatch(path)?;
    }

    let path = Path::new(&path);
    {
        let mut state_path = state.path.lock().unwrap();
        *state_path = Some(path.to_path_buf());
    }

    update_log(&app_handle)?;

    debouncer
        .watcher()
        .watch(Path::new(&path), notify::RecursiveMode::Recursive)?;

    Ok(())
}

fn parse_log<P: AsRef<Path>>(log_path: P) -> Vec<LogEntry> {
    let log = match fs::read_to_string(log_path) {
        Ok(log) => log,
        Err(_e) => "".to_string(),
    };

    let entries = log
        .split("\n")
        .fold(Vec::<LogEntry>::new(), |mut vec, line| {
            for level in LEVELS.iter() {
                if let Some(_) = line.find(level) {
                    vec.push(LogEntry {
                        text: line.to_string(),
                        level: level.to_string(),
                    });
                    return vec;
                }
            }
            match vec.last_mut() {
                Some(prev) => {
                    prev.text += &("\n".to_string() + line);
                }
                None => {
                    vec.push(LogEntry {
                        text: line.to_string(),
                        level: "OTHER".to_string(),
                    });
                }
            }
            vec
        });
    entries
}

fn update_log(app_handle: &tauri::AppHandle) -> Result<(), Error> {
    let state = app_handle.state::<AppState>();
    let path = state.path.lock().unwrap();
    match &*path {
        Some(path) => {
            app_handle.emit_all("LOG_CHANGES", parse_log(path))?;
        }
        None => {}
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![select_file])
        .setup(|app| {
            let app_handle = app.app_handle();

            let debouncer =
                notify_debouncer_mini::new_debouncer(Duration::from_secs(3), None, move |res| {
                    match res {
                        Ok(events) => {
                            println!("events: {:?}", events);
                            update_log(&app_handle).unwrap();
                        }
                        Err(e) => println!("watch error: {:?}", e),
                    }
                })?;

            let state = AppState {
                path: Mutex::new(None),
                debouncer: Mutex::new(debouncer),
            };
            app.manage(state);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
