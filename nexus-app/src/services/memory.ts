import { useMemoryStore, type MemoryEntry, type MemoryLayer } from '../stores/memoryStore';

export class MemoryService {
  /**
   * Add a new fact or memory to a specific layer.
   */
  async addMemory(content: string, layer: MemoryLayer, tags: string[] = [], agentId?: string, importance: 'low' | 'medium' | 'high' = 'medium') {
    const store = useMemoryStore.getState();
    store.addMemory({
      content,
      layer,
      tags,
      agentId,
      importance,
    });
  }

  /**
   * Retrieve memory context for an agent to include in system prompts.
   * This pulls from Core, Project, and Agent layers.
   */
  async getContextForAgent(agentId: string): Promise<string> {
    const store = useMemoryStore.getState();
    const relevantMemories = store.getMemoriesByAgent(agentId);
    
    if (relevantMemories.length === 0) return '';
    
    const formatted = relevantMemories
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(m => `- [${m.layer.toUpperCase()}] ${m.content}`)
      .join('\n');
      
    return `\n\n--- RELEVANT MEMORY & CONTEXT ---\n${formatted}\n---------------------------------\n`;
  }

  /**
   * Search through all memory layers using keyword match.
   * (Semantic RAG will be implemented here later)
   */
  async search(query: string): Promise<MemoryEntry[]> {
    const store = useMemoryStore.getState();
    // Local keyword search
    return store.searchMemories(query);
  }
  
  /**
   * Delete a specific memory item from local store.
   * Also attempts to delete from semantic store if it's an external ID.
   */
  async forget(memoryId: string) {
    const store = useMemoryStore.getState();
    store.removeMemory(memoryId);

    try {
      await fetch(`http://localhost:1421/memory/${memoryId}`, { method: 'DELETE' });
    } catch (e) {
      // It might only exist locally
    }
  }

  // ==========================================
  // Python Sidecar Semantic / RAG Capabilities
  // ==========================================

  /**
   * Adds a memory to the semantic layer (Mem0 + ChromaDB)
   */
  async addSemanticMemory(content: string, userId: string = 'default_user', agentId: string = 'nexus_system') {
    try {
      const resp = await fetch('http://localhost:1421/memory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content, agent_id: agentId })
      });
      return await resp.json();
    } catch (error) {
      console.error('Failed to add semantic memory:', error);
      throw error;
    }
  }

  /**
   * Search semantic memory across the neural index
   */
  async searchSemantic(query: string, userId: string = 'default_user') {
    try {
      const resp = await fetch('http://localhost:1421/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, query, limit: 5 })
      });
      return await resp.json();
    } catch (error) {
      console.error('Failed to search semantic memory:', error);
      return { success: false, results: [] };
    }
  }

  /**
   * Indexes an entire workspace directory using LlamaIndex
   */
  async indexWorkspace(workspacePath: string) {
    try {
      const resp = await fetch('http://localhost:1421/rag/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_path: workspacePath })
      });
      return await resp.json();
    } catch (error) {
      console.error('Failed to index workspace:', error);
      throw error;
    }
  }

  /**
   * Queries the indexed RAG knowledge base
   */
  async queryKnowledgeBase(query: string, limit: number = 5) {
    try {
      const resp = await fetch('http://localhost:1421/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });
      return await resp.json();
    } catch (error) {
      console.error('Failed to query knowledge base:', error);
      return { success: false, results: [] };
    }
  }
}

export const memoryService = new MemoryService();
