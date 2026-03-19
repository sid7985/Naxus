// ===== NEXUS Event Bus =====
// Lightweight pub-sub for cross-component communication
// Uses mitt for type-safe event emission

type Handler<T = any> = (event: T) => void;

interface EventMap {
  'agent:status-change': { agentId: string; status: string };
  'agent:task-complete': { agentId: string; taskId: string; result: string };
  'agent:error': { agentId: string; error: string };
  'mission:start': { prompt: string };
  'mission:complete': { taskCount: number; successCount: number };
  'mission:abort': void;
  'file:changed': { path: string };
  'file:created': { path: string };
  'file:deleted': { path: string };
  'toast:show': { message: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number };
  'notification:add': { title: string; body: string; type: string };
  'shortcut:triggered': { key: string };
}

class EventBus {
  private handlers: Map<string, Set<Handler>> = new Map();

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.handlers.get(event)?.forEach((h) => h(data));
  }

  once<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    const unsub = this.on(event, (data) => {
      handler(data);
      unsub();
    });
  }
}

export const eventBus = new EventBus();
export type { EventMap };
