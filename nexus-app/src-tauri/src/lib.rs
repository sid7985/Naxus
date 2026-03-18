// ===== NEXUS Tauri Backend Commands =====
// File operations, terminal execution, git, and system telemetry

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use std::process::Command;
use walkdir::WalkDir;
use notify::{Watcher, RecursiveMode, EventKind};
use std::sync::mpsc::channel;
use tauri::Emitter;

pub mod semantic_ops;

// ============================================
// Types
// ============================================

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub extension: Option<String>,
    pub modified: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub success: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub path: String,
    pub line_number: usize,
    pub line_content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub staged: Vec<String>,
    pub modified: Vec<String>,
    pub untracked: Vec<String>,
    pub ahead: u32,
    pub behind: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub hostname: String,
    pub total_memory_mb: u64,
    pub cpu_cores: usize,
}

// ============================================
// File Operations
// ============================================

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| format!("Failed to delete directory '{}': {}", path, e))
    } else {
        fs::remove_file(p).map_err(|e| format!("Failed to delete file '{}': {}", path, e))
    }
}

#[tauri::command]
fn rename_file(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to).map_err(|e| format!("Failed to rename '{}' to '{}': {}", from, to, e))
}

#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory '{}': {}", path, e))
}

#[tauri::command]
fn list_directory(path: String, max_depth: Option<usize>) -> Result<Vec<FileEntry>, String> {
    let depth = max_depth.unwrap_or(1);
    let mut entries = Vec::new();

    let walker = WalkDir::new(&path)
        .max_depth(depth)
        .min_depth(1)
        .sort_by_file_name();

    for entry in walker {
        let entry = entry.map_err(|e| format!("Walk error: {}", e))?;
        let metadata = entry.metadata().map_err(|e| format!("Metadata error: {}", e))?;

        let modified = metadata
            .modified()
            .ok()
            .and_then(|m| m.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs());

        entries.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            extension: entry
                .path()
                .extension()
                .map(|e| e.to_string_lossy().to_string()),
            modified,
        });
    }

    Ok(entries)
}

#[tauri::command]
fn start_directory_watch(app: tauri::AppHandle, path: String) -> Result<(), String> {
    std::thread::spawn(move || {
        let (tx, rx) = channel();
        let mut watcher = match notify::recommended_watcher(tx) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("Failed to init watcher: {}", e);
                return;
            }
        };
        
        if let Err(e) = watcher.watch(Path::new(&path), RecursiveMode::Recursive) {
            eprintln!("Failed to watch {}: {}", path, e);
            return;
        }

        for res in rx {
            if let Ok(event) = res {
                if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_)) {
                    let paths: Vec<String> = event.paths.iter().map(|p| p.to_string_lossy().to_string()).collect();
                    let _ = app.emit("file-changed", paths);
                }
            }
        }
    });
    Ok(())
}

#[tauri::command]
fn search_files(query: String, path: String) -> Result<Vec<SearchResult>, String> {
    let mut results = Vec::new();
    let query_lower = query.to_lowercase();

    for entry in WalkDir::new(&path)
        .max_depth(8)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if !entry.file_type().is_file() {
            continue;
        }

        // Skip binary/large files
        if let Ok(metadata) = entry.metadata() {
            if metadata.len() > 1_000_000 {
                continue;
            }
        }

        if let Ok(content) = fs::read_to_string(entry.path()) {
            for (line_idx, line) in content.lines().enumerate() {
                if line.to_lowercase().contains(&query_lower) {
                    results.push(SearchResult {
                        path: entry.path().to_string_lossy().to_string(),
                        line_number: line_idx + 1,
                        line_content: line.to_string(),
                    });

                    if results.len() >= 100 {
                        return Ok(results);
                    }
                }
            }
        }
    }

    Ok(results)
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

// ============================================
// Terminal / Shell Commands
// ============================================

#[tauri::command]
fn execute_command(cmd: String, cwd: Option<String>) -> Result<CommandOutput, String> {
    let working_dir = cwd.unwrap_or_else(|| ".".to_string());

    let output = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &cmd])
            .current_dir(&working_dir)
            .output()
    } else {
        Command::new("sh")
            .args(["-c", &cmd])
            .current_dir(&working_dir)
            .output()
    };

    match output {
        Ok(out) => Ok(CommandOutput {
            stdout: String::from_utf8_lossy(&out.stdout).to_string(),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
            exit_code: out.status.code().unwrap_or(-1),
            success: out.status.success(),
        }),
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

// ============================================
// Git Operations
// ============================================

fn run_git(args: &[&str], cwd: &str) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(|e| format!("Git command failed: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
fn git_status(repo_path: String) -> Result<GitStatus, String> {
    let branch = run_git(&["branch", "--show-current"], &repo_path).unwrap_or_default();

    let status_output = run_git(&["status", "--porcelain"], &repo_path)?;

    let mut staged = Vec::new();
    let mut modified = Vec::new();
    let mut untracked = Vec::new();

    for line in status_output.lines() {
        if line.len() < 3 {
            continue;
        }
        let file = line[3..].to_string();
        let index_status = line.chars().nth(0).unwrap_or(' ');
        let worktree_status = line.chars().nth(1).unwrap_or(' ');

        if index_status != ' ' && index_status != '?' {
            staged.push(file.clone());
        }
        if worktree_status == 'M' || worktree_status == 'D' {
            modified.push(file.clone());
        }
        if index_status == '?' {
            untracked.push(file);
        }
    }

    // Get ahead/behind counts
    let ahead_behind = run_git(&["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], &repo_path)
        .unwrap_or_else(|_| "0\t0".to_string());

    let counts: Vec<u32> = ahead_behind
        .split_whitespace()
        .filter_map(|s| s.parse().ok())
        .collect();

    Ok(GitStatus {
        branch,
        staged,
        modified,
        untracked,
        ahead: *counts.first().unwrap_or(&0),
        behind: *counts.get(1).unwrap_or(&0),
    })
}

#[tauri::command]
fn git_diff(repo_path: String, staged: Option<bool>) -> Result<String, String> {
    if staged.unwrap_or(false) {
        run_git(&["diff", "--cached"], &repo_path)
    } else {
        run_git(&["diff"], &repo_path)
    }
}

#[tauri::command]
fn git_log(repo_path: String, count: Option<u32>) -> Result<String, String> {
    let n = count.unwrap_or(20).to_string();
    run_git(
        &["log", "--oneline", "--graph", "--decorate", "-n", &n],
        &repo_path,
    )
}

#[tauri::command]
fn git_commit(repo_path: String, message: String) -> Result<String, String> {
    run_git(&["add", "."], &repo_path)?;
    run_git(&["commit", "-m", &message], &repo_path)
}

#[tauri::command]
fn git_branch_list(repo_path: String) -> Result<Vec<String>, String> {
    let output = run_git(&["branch", "--list"], &repo_path)?;
    Ok(output
        .lines()
        .map(|l| l.trim().trim_start_matches("* ").to_string())
        .filter(|l| !l.is_empty())
        .collect())
}

// ============================================
// System Info
// ============================================

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let hostname = Command::new("hostname")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        hostname,
        total_memory_mb: 0, // Would need sysinfo crate for accurate value
        cpu_cores: std::thread::available_parallelism()
            .map(|p| p.get())
            .unwrap_or(1),
    }
}

// ============================================
// Tauri App Entry
// ============================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            // File operations
            read_file,
            write_file,
            delete_file,
            rename_file,
            create_directory,
            list_directory,
            start_directory_watch,
            search_files,
            file_exists,
            // Terminal
            execute_command,
            // Git
            git_status,
            git_diff,
            git_log,
            git_commit,
            git_branch_list,
            // System
            get_system_info,
            // Sidecar
            semantic_ops::start_semantic_sidecar
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = semantic_ops::start_semantic_sidecar(app_handle).await {
                    eprintln!("Failed to start python sidecar: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
