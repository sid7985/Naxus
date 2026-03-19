import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Activity, BarChart3, Clock, Zap,
  AlertTriangle, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import NeonIcon from '../components/ui/NeonIcon';
import { useAgentStore } from '../stores/agentStore';
import PageTransition from '../components/layout/PageTransition';

// Metrics computed dynamically from agentStore

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function MetricCard({ label, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <GlassPanel elevated className="p-4">
      <div className="flex items-start justify-between mb-3">
        <NeonIcon icon={Icon} color={color} size="md" />
        {trend && (
          <div className="flex items-center gap-1 text-xs text-status-done">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold font-mono mb-1">{value.toLocaleString()}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </GlassPanel>
  );
}

export default function ObservabilityPage() {
  const navigate = useNavigate();
  const agents = useAgentStore((s) => s.agents);
  const missionFeed = useAgentStore((s) => s.missionFeed);
  const [activeView, setActiveView] = useState<'overview' | 'agents' | 'timeline'>('overview');

  // Compute global metrics from all agents
  const totalTokens = agents.reduce((sum, a) => sum + (a.metrics?.tokensUsed || 0), 0);
  const tasksCompleted = agents.reduce((sum, a) => sum + (a.metrics?.tasksCompleted || 0), 0);
  const totalErrors = agents.reduce((sum, a) => sum + (a.metrics?.errorCount || 0), 0);
  const totalExecTimeMs = agents.reduce((sum, a) => sum + (a.metrics?.totalExecutionTimeMs || 0), 0);
  
  const totalTasksStarted = tasksCompleted + totalErrors;
  const errorRateStr = totalTasksStarted > 0 ? `${((totalErrors / totalTasksStarted) * 100).toFixed(1)}%` : '0%';
  const avgLatencyStr = tasksCompleted > 0 ? `${(totalExecTimeMs / tasksCompleted / 1000).toFixed(1)}s` : '0s';
  const sessionsCount = missionFeed.filter((m) => m.role === 'user').length;

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-glass transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Activity className="w-5 h-5 text-agent-coder" />
          <h1 className="text-sm font-semibold">Observability Dashboard</h1>
        </div>
        <div className="flex items-center gap-1 bg-glass rounded-lg p-1">
          {(['overview', 'agents', 'timeline'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors capitalize ${
                activeView === view
                  ? 'bg-agent-coder/20 text-agent-coder'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Overview */}
        {activeView === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard label="Total Tokens" value={totalTokens} icon={Zap} color="#06B6D4" trend={totalTokens > 0 ? "+Live" : undefined} />
              <MetricCard label="Tasks Done" value={tasksCompleted} icon={CheckCircle} color="#10B981" />
              <MetricCard label="Avg Latency" value={avgLatencyStr} icon={Clock} color="#F59E0B" />
              <MetricCard label="Error Rate" value={errorRateStr} icon={AlertTriangle} color="#F43F5E" />
              <MetricCard label="Active Agents" value={agents.filter(a => a.status !== 'idle').length} icon={Activity} color="#7C3AED" />
              <MetricCard label="Missions" value={sessionsCount} icon={BarChart3} color="#6366F1" />
            </div>

            {/* Agent Performance Table */}
            <div>
              <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">
                Agent Performance
              </div>
              <GlassPanel className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Agent</th>
                      <th className="text-right text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Tokens</th>
                      <th className="text-right text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Tasks</th>
                      <th className="text-right text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Latency</th>
                      <th className="text-right text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Errors</th>
                      <th className="text-right text-[10px] text-text-muted font-mono uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => {
                      const avgLatency = agent.metrics?.tasksCompleted > 0 
                        ? `${(agent.metrics.totalExecutionTimeMs / agent.metrics.tasksCompleted / 1000).toFixed(1)}s` 
                        : '0s';
                      return (
                        <tr
                          key={agent.id}
                          className="border-b border-glass-border/50 hover:bg-glass transition-colors cursor-pointer"
                          onClick={() => navigate(`/agent/${agent.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: agent.color }}
                              />
                              <span className="text-sm" style={{ color: agent.color }}>
                                {agent.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-mono text-text-secondary">
                            {(agent.metrics?.tokensUsed || 0).toLocaleString()}
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-mono text-text-secondary">
                            {agent.metrics?.tasksCompleted || 0}
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-mono text-text-secondary">
                            {avgLatency}
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className={`text-sm font-mono ${(agent.metrics?.errorCount || 0) > 0 ? 'text-status-error' : 'text-status-done'}`}>
                              {agent.metrics?.errorCount || 0}
                            </span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              agent.status === 'idle' ? 'bg-glass text-text-muted'
                              : agent.status === 'thinking' ? 'bg-status-thinking/10 text-status-thinking'
                              : agent.status === 'acting' ? 'bg-status-acting/10 text-status-acting'
                              : agent.status === 'done' ? 'bg-status-done/10 text-status-done'
                              : 'bg-status-error/10 text-status-error'
                            }`}>
                              {agent.status || 'idle'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </GlassPanel>
            </div>

            {/* Resource Usage Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GlassPanel className="p-4">
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-4">
                  VRAM Usage
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Model Weights', value: 62, color: '#7C3AED' },
                    { label: 'KV Cache', value: 28, color: '#06B6D4' },
                    { label: 'Scratch Space', value: 10, color: '#F59E0B' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-mono" style={{ color: item.color }}>{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-void rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-4">
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-4">
                  System RAM
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'NEXUS App', value: 34, color: '#10B981' },
                    { label: 'Ollama Runtime', value: 45, color: '#6366F1' },
                    { label: 'OS & Other', value: 21, color: '#F43F5E' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-mono" style={{ color: item.color }}>{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-void rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </motion.div>
        )}

        {/* Agents View */}
        {activeView === 'agents' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {agents.map((agent) => {
              const avgLatency = agent.metrics?.tasksCompleted > 0 
                ? `${(agent.metrics.totalExecutionTimeMs / agent.metrics.tasksCompleted / 1000).toFixed(1)}s` 
                : '0s';
              return (
                <GlassPanel
                  key={agent.id}
                  hover
                  glowColor={agent.color}
                  className="p-5 cursor-pointer"
                  onClick={() => navigate(`/agent/${agent.id}`)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                      style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                    >
                      {agent.role === 'manager' ? '👑' : agent.role === 'coder' ? '💻' :
                       agent.role === 'designer' ? '🎨' : agent.role === 'marketer' ? '📣' :
                       agent.role === 'researcher' ? '🔍' : '🐛'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: agent.color }}>
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono uppercase">
                        {agent.status || 'idle'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-lg font-mono font-semibold">{(agent.metrics?.tokensUsed || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-text-muted">Tokens</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-semibold">{agent.metrics?.tasksCompleted || 0}</div>
                      <div className="text-[10px] text-text-muted">Tasks</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-semibold">{avgLatency}</div>
                      <div className="text-[10px] text-text-muted">Latency</div>
                    </div>
                    <div>
                      <div className={`text-lg font-mono font-semibold ${(agent.metrics?.errorCount || 0) > 0 ? 'text-status-error' : 'text-status-done'}`}>
                        {agent.metrics?.errorCount || 0}
                      </div>
                      <div className="text-[10px] text-text-muted">Errors</div>
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </motion.div>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">
              Recent Activity ({missionFeed.length} events)
            </div>
            {missionFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Clock className="w-8 h-8 text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted">No activity yet. Start a mission to see events here.</p>
              </div>
            ) : (
              missionFeed.slice(-20).reverse().map((msg) => {
                const agent = msg.agentRole ? agents.find((a) => a.role === msg.agentRole) : null;
                return (
                  <GlassPanel key={msg.id} className="p-3 flex items-start gap-3">
                    <div className="mt-1">
                      {msg.role === 'user' ? (
                        <div className="w-6 h-6 rounded-full bg-agent-manager/20 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-agent-manager" />
                        </div>
                      ) : msg.role === 'system' ? (
                        <div className="w-6 h-6 rounded-full bg-glass flex items-center justify-center">
                          <Activity className="w-3 h-3 text-text-muted" />
                        </div>
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${agent?.color || '#666'}20` }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ background: agent?.color || '#666' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold" style={{ color: agent?.color || '#A0A0B0' }}>
                          {msg.role === 'user' ? 'USER' : msg.role === 'system' ? 'SYSTEM' : `[${agent?.name.toUpperCase() || 'AGENT'}]`}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {msg.content.slice(0, 150)}{msg.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {msg.role === 'user' ? (
                        <XCircle className="w-3.5 h-3.5 text-text-muted" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-status-done/50" />
                      )}
                    </div>
                  </GlassPanel>
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
