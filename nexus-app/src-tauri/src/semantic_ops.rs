use tauri::{plugin::{Builder, TauriPlugin}, AppHandle, Runtime, Emitter};
use tauri_plugin_shell::{ShellExt, process::CommandEvent};

/// Spawns the python sidecar via the shell plugin
#[tauri::command]
pub async fn start_semantic_sidecar(app: AppHandle) -> Result<(), String> {
    println!("Starting nexus-python sidecar...");
    
    // Spawn the sidecar named "nexus-python" (registered in tauri.conf.json)
    let sidecar_command = app.shell().sidecar("nexus-python")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?;
        
    let (mut rx, mut _child) = sidecar_command
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    tauri::async_runtime::spawn(async move {
        // Read output from the sidecar until it dies
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let text = String::from_utf8_lossy(&line);
                    println!("[nexus-python stdout]: {}", text);
                }
                CommandEvent::Stderr(line) => {
                    let text = String::from_utf8_lossy(&line);
                    println!("[nexus-python stderr]: {}", text);
                }
                CommandEvent::Error(err) => {
                    println!("[nexus-python error]: {}", err);
                }
                CommandEvent::Terminated(payload) => {
                    println!("[nexus-python status] Sidecar terminated with payload: {:?}", payload);
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(())
}
