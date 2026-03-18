// ===== NEXUS Tauri Command Executor =====
// Safe wrapper around Tauri invoke() for frontend execution of Rust commands

import { invoke } from '@tauri-apps/api/core';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: Record<string, unknown>;
  }
}

export class TauriCommandService {
  /** Check if running inside Tauri */
  static get isTauri(): boolean {
    return !!window.__TAURI_INTERNALS__;
  }

  // --- File Operations ---
  static async readFile(path: string): Promise<string> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<string>('read_file', { path });
  }

  static async writeFile(path: string, content: string): Promise<void> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    await invoke('write_file', { path, content });
  }

  static async deleteFile(path: string): Promise<void> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    await invoke('delete_file', { path });
  }

  static async renameFile(from: string, to: string): Promise<void> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    await invoke('rename_file', { from, to });
  }

  static async createDirectory(path: string): Promise<void> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    await invoke('create_directory', { path });
  }

  static async listDirectory(path: string, depth = 1): Promise<any[]> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<any[]>('list_directory', { path, maxDepth: depth });
  }

  static async searchFiles(query: string, path: string): Promise<any[]> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<any[]>('search_files', { query, path });
  }

  static async fileExists(path: string): Promise<boolean> {
    if (!this.isTauri) return false;
    return await invoke<boolean>('file_exists', { path });
  }

  // --- Terminal / System ---
  static async executeCommand(cmd: string, cwd?: string): Promise<{ stdout: string; stderr: string; exit_code: number; success: boolean }> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke('execute_command', { cmd, cwd });
  }

  static async getSystemInfo(): Promise<any> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke('get_system_info');
  }

  // --- Git Operations ---
  static async gitStatus(repoPath: string): Promise<any> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke('git_status', { repoPath });
  }

  static async gitCommit(repoPath: string, message: string): Promise<string> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<string>('git_commit', { repoPath, message });
  }

  static async gitDiff(repoPath: string, staged = false): Promise<string> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<string>('git_diff', { repoPath, staged });
  }

  static async gitLog(repoPath: string, count = 20): Promise<string> {
    if (!this.isTauri) throw new Error('Not running in Tauri');
    return await invoke<string>('git_log', { repoPath, count });
  }
}

export const tauri = TauriCommandService;
