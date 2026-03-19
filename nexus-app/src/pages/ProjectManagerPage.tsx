import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, GitBranch, Clock,
  Star, Trash2
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageHeader from '../components/layout/PageHeader';
import PageTransition from '../components/layout/PageTransition';

interface Project {
  id: string;
  name: string;
  path: string;
  lastOpened: number;
  missionsRun: number;
  status: 'active' | 'paused' | 'completed';
  agents: string[];
  starred: boolean;
}

const DEMO_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'NEXUS App', path: '~/nexus-workspace',
    lastOpened: Date.now() - 300000, missionsRun: 24, status: 'active',
    agents: ['manager', 'coder', 'designer'], starred: true },
  {
    id: 'p2', name: 'Landing Page v2', path: '~/projects/landing-v2',
    lastOpened: Date.now() - 86400000, missionsRun: 8, status: 'active',
    agents: ['designer', 'coder', 'marketer'], starred: false },
  {
    id: 'p3', name: 'Mobile App Research', path: '~/projects/mobile-research',
    lastOpened: Date.now() - 172800000, missionsRun: 5, status: 'paused',
    agents: ['researcher'], starred: false },
  {
    id: 'p4', name: 'API Documentation', path: '~/projects/api-docs',
    lastOpened: Date.now() - 604800000, missionsRun: 12, status: 'completed',
    agents: ['coder', 'tester'], starred: true },
];

const AGENT_EMOJI: Record<string, string> = {
  manager: '👑', coder: '💻', designer: '🎨',
  marketer: '📣', researcher: '🔍', tester: '🐛' };

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'starred'>('all');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'starred') return p.starred;
    if (filter === 'active') return p.status === 'active';
    return true;
  });

  const toggleStar = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: `p-${Date.now()}`,
      name: newProjectName.trim(),
      path: `~/projects/${newProjectName.trim().toLowerCase().replace(/\s+/g, '-')}`,
      lastOpened: Date.now(),
      missionsRun: 0,
      status: 'active',
      agents: ['manager'],
      starred: false };
    setProjects((prev) => [project, ...prev]);
    setNewProjectName('');
    setShowNewForm(false);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const statusConfig = {
    active: { color: '#10B981', label: 'Active' },
    paused: { color: '#F59E0B', label: 'Paused' },
    completed: { color: '#6366F1', label: 'Done' } };

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      <PageHeader
        title="Project Manager"
        subtitle="Manage your workspaces"
        icon={FolderOpen}
        iconColor="#10B981"
        badge={`${projects.length} projects`}
        actions={
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-agent-marketer/10 text-agent-marketer text-xs hover:bg-agent-marketer/20 transition-colors border border-agent-marketer/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-5 py-2.5">
        <div className="tab-pills">
          {(['all', 'active', 'starred'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab-pill capitalize ${filter === f ? 'active' : ''}`}
            >
              {f === 'starred' ? '⭐ Starred' : f === 'all' ? `All (${projects.length})` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* New project form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <GlassPanel className="p-4 flex gap-3">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  placeholder="Project name..."
                  className="flex-1 bg-glass border border-glass-border rounded-lg px-4 py-2 text-sm text-white placeholder:text-text-muted outline-none focus:border-agent-marketer/50"
                  autoFocus
                />
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 rounded-lg bg-agent-marketer text-white text-xs font-medium disabled:opacity-30"
                >
                  Create
                </button>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filteredProjects.map((project, idx) => {
              const sc = statusConfig[project.status];
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <GlassPanel hover className="p-4 cursor-pointer group">
                    <div className="flex items-start gap-4">
                      {/* Project icon */}
                      <div className="w-12 h-12 rounded-xl bg-glass flex items-center justify-center shrink-0">
                        <FolderOpen className="w-6 h-6" style={{ color: sc.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{project.name}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono"
                            style={{ background: `${sc.color}15`, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                          {project.starred && <Star className="w-3.5 h-3.5 text-agent-designer fill-agent-designer" />}
                        </div>

                        {/* Path */}
                        <div className="text-xs text-text-muted font-mono mb-2">{project.path}</div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-4 text-[10px] text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(project.lastOpened)}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {project.missionsRun} missions
                          </span>
                          <div className="flex items-center gap-0.5">
                            {project.agents.map((role) => (
                              <span key={role} title={role} className="text-xs">
                                {AGENT_EMOJI[role] || '🤖'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStar(project.id); }}
                          className="p-1.5 rounded-lg hover:bg-glass transition-colors"
                          title={project.starred ? 'Unstar' : 'Star'}
                        >
                          <Star className={`w-3.5 h-3.5 ${project.starred ? 'text-agent-designer fill-agent-designer' : 'text-text-muted'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                          className="p-1.5 rounded-lg hover:bg-status-error/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-status-error" />
                        </button>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40">
              <FolderOpen className="w-8 h-8 text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">No projects match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
