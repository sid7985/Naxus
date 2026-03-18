import os
import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.core.postprocessor import LLMRerank

class RagIndexer:
    """Handles workspace indexing and document chunking using LlamaIndex + ChromaDB + Ollama"""
    
    def __init__(self):
        # Configure LLM and Embeddings to use Local Ollama
        self.llm = Ollama(model="llama3.2:1b", request_timeout=120.0, base_url="http://localhost:11434")
        self.embed_model = OllamaEmbedding(model_name="nomic-embed-text", base_url="http://localhost:11434")
        
        # Setup ChromaDB persistent storage location (shared with Mem0 but different collection)
        home_dir = os.path.expanduser("~")
        chroma_path = os.path.join(home_dir, ".nexus", "memory", "chroma")
        os.makedirs(chroma_path, exist_ok=True)
        
        self.db = chromadb.PersistentClient(path=chroma_path)
        self.chroma_collection = self.db.get_or_create_collection("nexus_workspace_rag")
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

    def index_workspace(self, path: str):
        """Recursively parses and indexes all supported files in a given directory."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"Workspace path {path} does not exist.")
            
        print(f"📚 Indexing workspace: {path}")
        
        # We define a custom SimpleDirectoryReader specifying what files to parse
        supported_exts = [".txt", ".md", ".py", ".js", ".ts", ".tsx", ".json", ".rs", ".html", ".css"]
        
        reader = SimpleDirectoryReader(
            input_dir=path,
            recursive=True,
            required_exts=supported_exts,
            filename_as_id=True,
        )
        documents = reader.load_data()
        print(f"Found {len(documents)} documents. Chunking...")

        # Chunk logic: break large code/text down into 512 token chunks
        parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        nodes = parser.get_nodes_from_documents(documents)
        
        # Insert into ChromaDB 
        index = VectorStoreIndex(
            nodes,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
        )
        print(f"✅ RAG Indexing complete! Indexed {len(nodes)} chunks.")
        
        return {
            "success": True,
            "document_count": len(documents),
            "chunk_count": len(nodes)
        }

    def index_text(self, text: str, metadata: dict = None):
        """Indexes raw text (e.g. from a web scrape) into ChromaDB."""
        from llama_index.core import Document
        doc = Document(text=text, metadata=metadata or {})
        
        parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        nodes = parser.get_nodes_from_documents([doc])
        
        index = VectorStoreIndex(
            nodes,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
        )
        print(f"✅ RAG Text Indexing complete! Indexed {len(nodes)} chunks.")
        
        return {
            "success": True,
            "document_count": 1,
            "chunk_count": len(nodes)
        }

    def query(self, search_text: str, top_k: int = 5):
        """Query the vector store for semantic matches"""
        index = VectorStoreIndex.from_vector_store(
            self.vector_store,
            embed_model=self.embed_model,
        )
        
        # We fetch top_k * 3 candidates, then LLMRerank down to top_k
        fetch_k = top_k * 3
        retriever = index.as_retriever(similarity_top_k=fetch_k)
        nodes = retriever.retrieve(search_text)
        
        # Apply LLM Reranker using our local Ollama model
        reranker = LLMRerank(
            choice_batch_size=5,
            top_n=top_k,
            llm=self.llm
        )
        # We must construct a dummy query bundle (or just pass the string)
        from llama_index.core.schema import QueryBundle
        try:
            nodes = reranker.postprocess_nodes(nodes, query_bundle=QueryBundle(search_text))
        except Exception as e:
            print(f"Reranking failed, falling back to base retrieval: {e}")
            nodes = nodes[:top_k]
        
        results = []
        for n in nodes:
            results.append({
                "content": n.get_content(),
                "score": n.get_score(),
                "metadata": n.metadata
            })
            
        return results

rag_indexer = RagIndexer()
