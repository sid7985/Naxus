import { useState, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Code2, Palette, Megaphone, Bug, Search,
  ArrowLeft, Rocket, GripVertical
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';
import { DEFAULT_AGENTS } from '../lib/constants';
import type { AgentRole } from '../lib/types';
import PageTransition from '../components/layout/PageTransition';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

type TaskItem = {
  id: string;
  title: string;
  assignee: AgentRole;
};

export default function MissionBuilderPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const addMissionFeedMessage = useAgentStore((s) => s.addMissionFeedMessage);
  const workspace = useSettingsStore((s) => s.workspace);

  const generateTasks = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);

    try {
      const response = await ollama.generate(
        workspace.modelAssignments.manager,
        `You are a Technical Project Manager. Break down the following epic into 2 to 5 specific, actionable sub-tasks distributed across your specialized team (manager, coder, designer, researcher, tester, marketer). 
        
        Respond ONLY with a raw JSON object (no markdown, no backticks). Schema:
        {"objective": "A clear one sentence summary", "tasks": [{"id": "t1", "title": "Exact task description", "assignee": "coder"}]}
        
        Epic: ${description}`
      );

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setObjective(parsed.objective || description);
          if (Array.isArray(parsed.tasks)) {
            setTasks(parsed.tasks.map((t: any, i: number) => ({
              id: t.id || `task-${i}`,
              title: t.title || 'Unknown Task',
              assignee: (t.assignee as AgentRole) || 'coder',
            })));
          }
        }
      } catch (err) {
        // Fallback if parsing fails
        setObjective(description);
        setTasks([{ id: 't1', title: 'Execute primary directive', assignee: 'coder' }]);
      }
    } catch {
      setObjective(description);
      setTasks([{ id: 't1', title: 'System failed to parse epic. Proceeding manually.', assignee: 'manager' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const launchMission = () => {
    const formattedTasks = tasks.map(t => `- [${t.assignee.toUpperCase()}] ${t.title}`).join('\n');
    addMissionFeedMessage({
      role: 'assistant',
      content: `🚀 **Mission Blueprint Finalized**\n\n**Objective:** ${objective}\n\n**Execution Plan:**\n${formattedTasks}\n\nTeam is initiating execution cycle now.`,
      agentId: 'agent-manager',
      agentRole: 'manager',
    });
    // In a real system, we would inject these into the useRpgStore's activeQuest here.
    navigate('/command');
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag ghost to render before hiding the original (optional)
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, targetRole: AgentRole) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks(prev => prev.map(task => 
      task.id === draggedTaskId ? { ...task, assignee: targetRole } : task
    ));
    setDraggedTaskId(null);
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col bg-void overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-void/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/command')} className="text-text-muted hover:text-white transition-colors h-8 w-8 rounded flex items-center justify-center hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono tracking-widest text-agent-manager uppercase">Visual Mission Builder</span>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={launchMission}
            className="px-6 py-2 rounded font-medium flex items-center gap-2 transition-all hover:scale-105 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            style={{ background: 'var(--gradient-agent-manager)' }}
          >
            EXECUTE
            <Rocket className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
        
        {/* Input Phase */}
        <GlassPanel className="p-6 shrink-0 z-10 border-white/5 bg-void-light/50 backdrop-blur-md">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Define your epic. What are we building today?"
            className="w-full bg-transparent text-xl text-white placeholder:text-text-muted/50 outline-none resize-none mb-4 leading-relaxed font-light"
            rows={2}
          />
          <div className="flex justify-end">
            <button
              onClick={generateTasks}
              disabled={!description.trim() || isGenerating}
              className="px-6 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-white/5 disabled:opacity-40 transition-colors border border-glass-border"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-text-muted border-t-white rounded-full animate-spin" /> Analyzing...</>
              ) : (
                 <><Crown className="w-4 h-4 text-agent-manager" /> Breakdown Epic</>
              )}
            </button>
          </div>
        </GlassPanel>

        {/* Kanban Board Phase */}
        <AnimatePresence>
          {tasks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-glass-border scrollbar-track-transparent"
            >
              {DEFAULT_AGENTS.map(agent => {
                const agentTasks = tasks.filter(t => t.assignee === agent.role);
                const Icon = ICON_MAP[agent.icon];
                
                return (
                  <div 
                    key={agent.role}
                    className="flex flex-col min-w-[300px] max-w-[350px] flex-1"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, agent.role as AgentRole)}
                  >
                    {/* Column Header */}
                    <div className="flex items-center gap-3 mb-4 px-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ background: `${agent.color}15`, borderColor: `${agent.color}30` }}>
                        <Icon className="w-4 h-4" style={{ color: agent.color }} />
                      </div>
                      <h3 className="font-medium text-sm text-text-secondary">{agent.name}</h3>
                      <div className="ml-auto text-xs font-mono text-text-muted bg-white/5 px-2 py-0.5 rounded">{agentTasks.length}</div>
                    </div>

                    {/* Draggable Task List container */}
                    <div className={`flex-1 rounded-xl p-2 transition-colors border-2 ${
                      draggedTaskId ? 'border-dashed border-white/10 bg-white/[0.02]' : 'border-transparent bg-transparent'
                    }`}>
                      <AnimatePresence>
                        {agentTasks.map(task => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          >
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              className="group cursor-grab active:cursor-grabbing mb-3"
                            >
                              <GlassPanel hover elevated className="p-4 bg-void/80 border-white/10 flex gap-3 pb-5 relative overflow-hidden">
                                {/* Subtle agent color accent */}
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: agent.color }} />
                                
                                <GripVertical className="w-4 h-4 text-text-muted/30 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-sm text-white font-medium leading-snug pr-2">{task.title}</p>
                              </GlassPanel>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {/* Empty state placeholder */}
                      {agentTasks.length === 0 && (
                        <div className="h-24 rounded border border-dashed border-glass-border flex items-center justify-center text-xs text-text-muted font-mono bg-void/30">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}
