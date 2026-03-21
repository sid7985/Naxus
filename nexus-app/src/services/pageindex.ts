// NEXUS PageIndex Service
// Connects to the local Python FastAPI backend for Document Tree RAG

const PAGEINDEX_URL = 'http://localhost:8080/api';

export interface PageIndexTree {
  title: string;
  node_id: string;
  start_index: number;
  end_index: number;
  summary: string;
  nodes?: PageIndexTree[];
  error?: string;
  message?: string;
}

export interface TreeQueryResult {
  answer: string;
  nodes_visited: string[];
}

export const pageIndexService = {
  /**
   * Upload a PDF document and generate its PageIndex tree structure
   */
  indexDocument: async (file: File): Promise<{ filename: string; tree: PageIndexTree }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${PAGEINDEX_URL}/index-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to index document');
      }

      return await response.json();
    } catch (error) {
      console.error('PageIndex indexing failed:', error);
      throw error;
    }
  },

  /**
   * Query the generated tree structure
   */
  queryTree: async (query: string, treeData: any): Promise<TreeQueryResult> => {
    try {
      const response = await fetch(`${PAGEINDEX_URL}/query-tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, tree_data: treeData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to query tree');
      }

      return await response.json();
    } catch (error) {
      console.error('PageIndex query failed:', error);
      throw error;
    }
  },
  
  /**
   * Check if backend is alive
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/health', {
        method: 'GET',
        // short timeout
        signal: AbortSignal.timeout(1500)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
