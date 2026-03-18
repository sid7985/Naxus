import os
from mem0 import Memory

class NexusMemoryManager:
    """Wrapper around Mem0 to handle local embedding models through Ollama and ChromaDB storage."""
    
    def __init__(self):
        # Determine the user's workspace path for storing the sqlite DBs
        # We'll use ~/.nexus/memory internally or let the frontend pass in a path.
        home_dir = os.path.expanduser("~")
        nexus_dir = os.path.join(home_dir, ".nexus", "memory")
        os.makedirs(nexus_dir, exist_ok=True)
        
        # Configure Mem0 to use local models exclusively.
        # We use ollama for both LLM and Embeddings, and ChromaDB for vector storage.
        config = {
            "version": "v1.1",
            "llm": {
                "provider": "ollama",
                "config": {
                    "model": "llama3.2:1b",
                    "temperature": 0.1,
                    "max_tokens": 1000,
                    "ollama_base_url": "http://localhost:11434",
                }
            },
            "embedder": {
                "provider": "ollama",
                "config": {
                    "model": "nomic-embed-text",
                    "ollama_base_url": "http://localhost:11434"
                }
            },
            "vector_store": {
                "provider": "chroma",
                "config": {
                    "collection_name": "nexus_semantic_memory",
                    "path": os.path.join(nexus_dir, "chroma")
                }
            }
        }
        
        try:
            self.memory = Memory.from_config(config_dict=config)
            print("🚀 NexusMemoryManager initialized successfully with Local Ollama + ChromaDB.")
        except Exception as e:
            print(f"⚠️ Warning: Failed to connect to Ollama during Mem0 initialization. Start `ollama serve` and restart the client. {e}")
            self.memory = None

    def add_memory(self, user_id: str, content: str, agent_id: str = "nexus_system"):
        """Adds a memory to the vector store."""
        if not self.memory: raise Exception("Mem0 Offline: Start Ollama and restart the sidecar.")
        print(f"Adding memory for agent {agent_id}: {content}")
        return self.memory.add(content, user_id=user_id, agent_id=agent_id)
        
    def search_memory(self, user_id: str, query: str, agent_id: str = None, limit: int = 5):
        """Searches for relevant semantically similar memories."""
        if not self.memory: raise Exception("Mem0 Offline: Start Ollama and restart the sidecar.")
        return self.memory.search(query, user_id=user_id, agent_id=agent_id, limit=limit)
        
    def delete_memory(self, memory_id: str):
        """Deletes a specific memory entry."""
        if not self.memory: raise Exception("Mem0 Offline: Start Ollama and restart the sidecar.")
        return self.memory.delete(memory_id)
        
    def get_all(self, user_id: str):
        """Gets all memories for a user."""
        if not self.memory: raise Exception("Mem0 Offline: Start Ollama and restart the sidecar.")
        return self.memory.get_all(user_id=user_id)

# Singleton instance
memory_manager = NexusMemoryManager()
