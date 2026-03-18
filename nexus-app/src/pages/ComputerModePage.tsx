import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Monitor, Play, Square, 
  Terminal, FileText, Clipboard, Activity
} from 'lucide-react';
import { useSkillsStore } from '../stores/skillsStore';
import GlassPanel from '../components/ui/GlassPanel';
import { tauri } from '../services/tauri';

export default function ComputerModePage() {
  const navigate = useNavigate();
  const skills = useSkillsStore(s => s.skills);
  const [activeDaemons, setActiveDaemons] = useState<string[]>(['clipboard']);

  const toggleFileSystemWatcher = async () => {
    if (activeDaemons.includes('file_system')) {
      setActiveDaemons(prev => prev.filter(d => d !== 'file_system'));
    } else {
      // In production, this path would be dynamic. Hardcoded for MVP.
      const homePath = '/Users/siddharthjaiswal/Documents/NexusWorkspaces';
      try {
        await tauri.executeCommand('start_directory_watch', homePath);
        setActiveDaemons(prev => [...prev, 'file_system']);
      } catch (e) {
        console.error("Failed to start rust notification daemon:", e);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Monitor className="w-5 h-5 text-agent-coder" />
          <h1 className="text-sm font-semibold">Background Automations</h1>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6">
        {/* Watcher Daemons */}
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Active Watcher Daemons</h2>
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="p-4 flex items-center justify-between border-l-2 border-l-agent-researcher">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-agent-researcher/10 rounded-lg">
                  <Clipboard className="w-5 h-5 text-agent-researcher" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Clipboard Watcher</h3>
                  <p className="text-xs text-text-muted mt-0.5">Polling OS clipboard every 2s</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-status-done/10 text-status-done text-xs font-mono">
                <Activity className="w-3 h-3 animate-pulse" /> RUNNING
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 flex items-center justify-between border-l-2 border-l-agent-coder">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-agent-coder/10 rounded-lg">
                  <FileText className="w-5 h-5 text-agent-coder" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">File System Watcher</h3>
                  <p className="text-xs text-text-muted mt-0.5">Rust `notify` crate event hooks</p>
                </div>
              </div>
              <button 
                onClick={toggleFileSystemWatcher}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeDaemons.includes('file_system') 
                    ? 'bg-status-done/10 text-status-done' 
                    : 'bg-glass hover:bg-white/5 text-text-muted'
                }`}
              >
                {activeDaemons.includes('file_system') ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                {activeDaemons.includes('file_system') ? 'LISTENING' : 'START DAEMON'}
              </button>
            </GlassPanel>
          </div>
        </section>

        {/* Saved Skills */}
        <section className="flex-1 border-t border-glass-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Loaded Mission Skills (Triggers)</h2>
            <button className="px-3 py-1.5 rounded-lg bg-glass text-xs text-white hover:bg-white/10 transition">
              + Add Skill Trigger
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {skills.map((skill) => (
                <motion.div key={skill.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassPanel hover className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          skill.trigger === 'clipboard' ? 'bg-agent-researcher/10' : 'bg-agent-coder/10'
                        }`}>
                          <Terminal className={`w-4 h-4 ${
                            skill.trigger === 'clipboard' ? 'text-agent-researcher' : 'text-agent-coder'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">{skill.name}</h3>
                          <p className="text-xs text-text-muted mt-1">{skill.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-glass text-text-muted uppercase">
                          ON {skill.trigger}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 capitalize">
                          → {skill.agentRole}
                        </span>
                      </div>
                    </div>
                    {/* Prompt Template Preview */}
                    <div className="bg-void border border-glass-border rounded-lg p-2.5 mt-1 font-mono text-[10px] text-text-muted whitespace-pre-wrap">
                      {skill.promptTemplate}
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
