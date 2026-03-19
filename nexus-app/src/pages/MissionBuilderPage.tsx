import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, Code2, Palette, Megaphone, Bug, Search,
  ArrowLeft, Rocket, Pencil
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useAgentStore } from '../stores/agentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';
import { DEFAULT_AGENTS } from '../lib/constants';
import type { AgentRole } from '../lib/types';
import PageTransition from '../components/layout/PageTransition';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Crown, Code2, Palette, Megaphone, Bug, Search,
};

export default function MissionBuilderPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<AgentRole[]>(['manager']);
  const [missionBrief, setMissionBrief] = useState<{
    objective: string;
    agents: string;
    priority: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addMissionFeedMessage = useAgentStore((s) => s.addMissionFeedMessage);
  const workspace = useSettingsStore((s) => s.workspace);

  const toggleAgent = (role: AgentRole) => {
    setSelectedAgents((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const generateBrief = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);

    try {
      const response = await ollama.generate(
        workspace.modelAssignments.manager,
        `You are NEXUS Manager. Generate a short mission brief for the following goal. Respond ONLY with a JSON object: {"objective": "one sentence", "priority": "Class-A Alpha|Class-B Standard|Class-C Explore"}\n\nGoal: ${description}`
      );

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setMissionBrief({
            objective: parsed.objective || description,
            agents: selectedAgents.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', '),
            priority: parsed.priority || 'Class-B Standard',
          });
        }
      } catch {
        setMissionBrief({
          objective: description,
          agents: selectedAgents.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', '),
          priority: 'Class-B Standard',
        });
      }
    } catch {
      setMissionBrief({
        objective: description,
        agents: selectedAgents.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', '),
        priority: 'Class-B Standard',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const launchMission = () => {
    addMissionFeedMessage({
      role: 'assistant',
      content: `🚀 **Mission Launched**\n\n**Objective:** ${missionBrief?.objective || description}\n**Agents:** ${missionBrief?.agents}\n**Priority:** ${missionBrief?.priority}\n\nManager is now delegating tasks...`,
      agentId: 'agent-manager',
      agentRole: 'manager',
    });
    navigate('/');
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-glass-border flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-text-muted">Workspace › </span>
        <span className="text-sm text-agent-manager">New Mission</span>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Description input */}
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setMissionBrief(null);
          }}
          placeholder="Describe what you want to build..."
          className="w-full bg-transparent text-2xl text-white placeholder:text-text-muted/50 outline-none resize-none mb-6 leading-relaxed"
          rows={3}
        />

        <div className="w-full h-px bg-glass-border mb-8" />

        {/* Agent selector */}
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-4">
            Select Specialized Agents
          </div>
          <div className="grid grid-cols-3 gap-3">
            {DEFAULT_AGENTS.map((agent) => {
              const IconComponent = ICON_MAP[agent.icon];
              const isSelected = selectedAgents.includes(agent.role);
              return (
                <motion.button
                  key={agent.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleAgent(agent.role)}
                >
                  <GlassPanel
                    className={`p-5 flex flex-col items-center gap-3 transition-all duration-200 ${
                      isSelected ? '!border-agent-manager/50' : ''
                    }`}
                    glowColor={isSelected ? agent.color : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `${agent.color}${isSelected ? '20' : '10'}`,
                        border: `1px solid ${agent.color}${isSelected ? '50' : '20'}`,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: agent.color, opacity: isSelected ? 1 : 0.5 }}
                        />
                      )}
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-white' : 'text-text-muted'}`}>
                      {agent.name}
                    </span>
                  </GlassPanel>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mission brief */}
        {missionBrief && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassPanel className="p-6 mb-8">
              <div className="text-xs uppercase tracking-widest text-agent-manager font-mono mb-4">
                Mission Brief
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-text-muted w-32 shrink-0">Objective</span>
                  <span className="text-sm text-text-secondary">{missionBrief.objective}</span>
                </div>
                <div className="h-px bg-glass-border" />
                <div className="flex items-center">
                  <span className="text-sm text-text-muted w-32 shrink-0">Selected Unit</span>
                  <span className="text-sm text-text-secondary">{missionBrief.agents}</span>
                </div>
                <div className="h-px bg-glass-border" />
                <div className="flex items-center">
                  <span className="text-sm text-text-muted w-32 shrink-0">Priority Level</span>
                  <span className="text-sm text-text-secondary">{missionBrief.priority}</span>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {missionBrief ? (
            <button
              onClick={() => setMissionBrief(null)}
              className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Brief
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              if (missionBrief) {
                launchMission();
              } else {
                generateBrief();
              }
            }}
            disabled={!description.trim() || isGenerating}
            className="px-8 py-3.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-40"
            style={{
              background: missionBrief
                ? 'linear-gradient(135deg, #7C3AED, #F59E0B)'
                : 'linear-gradient(135deg, #7C3AED, #6366F1)',
              boxShadow: `0 0 30px -5px rgba(124, 58, 237, 0.4)`,
            }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Brief...
              </>
            ) : missionBrief ? (
              <>
                LAUNCH MISSION
                <Rocket className="w-4 h-4" />
              </>
            ) : (
              <>Generate Brief</>
            )}
          </button>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
