import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, Play, Plus, Save,
  Share2, Zap, Users
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import PageTransition from '../components/layout/PageTransition';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  agents: string[];
  steps: number;
  category: 'productivity' | 'dev' | 'content' | 'research';
  color: string;
}

const TEMPLATES: WorkflowTemplate[] = [
  { id: 'w1', name: 'Morning Standup', description: 'Generate daily standup report from git activity', icon: '☀️', agents: ['manager', 'coder'], steps: 4, category: 'productivity', color: '#F59E0B' },
  { id: 'w2', name: 'Code Review Pipeline', description: 'Auto-review PRs with Coder + Tester', icon: '🔍', agents: ['coder', 'tester'], steps: 6, category: 'dev', color: '#06B6D4' },
  { id: 'w3', name: 'Blog Post Generator', description: 'Research topic → write draft → create images', icon: '📝', agents: ['researcher', 'marketer', 'designer'], steps: 5, category: 'content', color: '#10B981' },
  { id: 'w4', name: 'Competitor Analysis', description: 'Deep research on competitors + summary report', icon: '📊', agents: ['researcher', 'marketer'], steps: 3, category: 'research', color: '#6366F1' },
  { id: 'w5', name: 'Bug Triage', description: 'Scan repo for issues, prioritize, assign agents', icon: '🐛', agents: ['tester', 'coder', 'manager'], steps: 5, category: 'dev', color: '#F43F5E' },
  { id: 'w6', name: 'Deploy & Verify', description: 'Build → deploy → smoke test → report', icon: '🚀', agents: ['coder', 'tester'], steps: 4, category: 'dev', color: '#7C3AED' },
  { id: 'w7', name: 'Weekly Report', description: 'Summarize week\'s activity across all agents', icon: '📋', agents: ['manager'], steps: 3, category: 'productivity', color: '#F97316' },
  { id: 'w8', name: 'Social Media Pack', description: 'Generate posts, images, and schedule', icon: '📱', agents: ['marketer', 'designer'], steps: 4, category: 'content', color: '#14B8A6' },
];

const AGENT_COLORS: Record<string, string> = {
  manager: '#7C3AED', coder: '#06B6D4', designer: '#F59E0B',
  marketer: '#10B981', researcher: '#6366F1', tester: '#F43F5E' };

export default function WorkflowPage() {
  const [filter, setFilter] = useState<'all' | 'productivity' | 'dev' | 'content' | 'research'>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);

  const filtered = TEMPLATES.filter((w) => filter === 'all' || w.category === filter);

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      <PageHeader
        title="Workflows & Skills"
        subtitle="Multi-agent automation templates"
        icon={Workflow}
        iconColor="#10B981"
        badge={`${TEMPLATES.length} templates`}
        actions={
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-agent-marketer/10 text-agent-marketer text-xs hover:bg-agent-marketer/20 transition-colors border border-agent-marketer/20">
            <Plus className="w-3.5 h-3.5" />
            New Workflow
          </button>
        }
      />

      {/* Category filter */}
      <div className="flex items-center gap-2 px-5 py-2.5">
        <div className="tab-pills">
          {(['all', 'productivity', 'dev', 'content', 'research'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab-pill capitalize ${filter === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Workflow grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((wf) => (
              <GlassPanel
                key={wf.id}
                hover
                onClick={() => setSelectedWorkflow(wf)}
                className={`p-4 cursor-pointer ${selectedWorkflow?.id === wf.id ? '!border-white/20' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{wf.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-0.5">{wf.name}</div>
                    <div className="text-xs text-text-muted mb-2">{wf.description}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {wf.agents.map((role) => (
                          <span key={role} className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: `${AGENT_COLORS[role] || '#666'}15`, color: AGENT_COLORS[role] }}>
                            {role}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {wf.steps} steps
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedWorkflow && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="spatial-detail-panel shrink-0"
            >
              <div className="w-80 p-4 space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{selectedWorkflow.icon}</div>
                  <div className="text-lg font-semibold">{selectedWorkflow.name}</div>
                  <div className="text-xs text-text-muted mt-1">{selectedWorkflow.description}</div>
                </div>

                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-2">Agents Involved</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWorkflow.agents.map((role) => (
                      <span key={role} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono" style={{ background: `${AGENT_COLORS[role]}15`, color: AGENT_COLORS[role] }}>
                        <Users className="w-3 h-3" /> {role}
                      </span>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-3">
                  <div className="text-[10px] text-text-muted uppercase font-mono mb-2">Details</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-text-muted">Steps</span><span>{selectedWorkflow.steps}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Category</span><span className="capitalize">{selectedWorkflow.category}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Est. Time</span><span>{selectedWorkflow.steps * 15}s</span></div>
                  </div>
                </GlassPanel>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-agent-marketer to-agent-coder text-white text-xs font-medium hover:brightness-110 transition-all">
                    <Play className="w-3.5 h-3.5" /> Run Now
                  </button>
                  <button className="p-2.5 rounded-lg bg-glass text-text-secondary hover:text-white transition-colors" title="Save as Skill">
                    <Save className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-lg bg-glass text-text-secondary hover:text-white transition-colors" title="Export">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}
