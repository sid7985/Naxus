from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional, Any
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-python")

app = FastAPI(title="NEXUS Semantic Sidecar", version="0.1.0")

# Import memory manager
from memory.mem0_client import memory_manager

# Import RAG indexer
from rag.indexer import rag_indexer

from vision.capturer import ScreenCapturer
from claw.executor import ClawExecutor, ClawAction
from claw.safety import SafetyTier

# Import Network and Scraper
from network.web_proxy import fetch_via_proxy, ProxyRequest
from network.playwright_scraper import scrape_page, ScrapeRequest
from mcp_host import mcp_api

vision_capturer = ScreenCapturer()
claw_executor = ClawExecutor()

# Initialize the main API application
app = FastAPI(title="NEXUS Semantic & Vision Sidecar", version="0.6.0")

class HealthCheckResponse(BaseModel):
    status: str
    version: str

class MemoryAddRequest(BaseModel):
    user_id: str
    content: str
    agent_id: Optional[str] = "nexus_system"
    tags: Optional[List[str]] = []

class MemorySearchRequest(BaseModel):
    user_id: str
    query: str
    agent_id: Optional[str] = None
    limit: Optional[int] = 5

class RagIndexRequest(BaseModel):
    workspace_path: str

class RagQueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class RagIndexUrlRequest(BaseModel):
    url: str

class SafetyRequest(BaseModel):
    tier: SafetyTier

@app.get("/ping", response_model=HealthCheckResponse)
async def ping():
    """Health check endpoint for Tauri to verify sidecar is running."""
    return {"status": "ok", "version": "0.1.0"}

@app.post("/memory/add")
async def add_memory(req: MemoryAddRequest):
    """Add a memory event/fact to the local ChromaDB via Mem0."""
    try:
        res = memory_manager.add_memory(
            user_id=req.user_id,
            content=req.content,
            agent_id=req.agent_id
        )
        return {"success": True, "result": res}
    except Exception as e:
        logger.error(f"Error adding memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memory/search")
async def search_memory(req: MemorySearchRequest):
    """Search for semantically relevant memories."""
    try:
        res = memory_manager.search_memory(
            user_id=req.user_id,
            query=req.query,
            agent_id=req.agent_id,
            limit=req.limit
        )
        return {"success": True, "results": res}
    except Exception as e:
        logger.error(f"Error searching memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memory/{memory_id}")
async def delete_memory(memory_id: str):
    """Delete a memory by its Mem0 ID."""
    try:
        res = memory_manager.delete_memory(memory_id)
        return {"success": True, "result": res}
    except Exception as e:
        logger.error(f"Error deleting memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/all/{user_id}")
async def get_all_memories(user_id: str):
    """Get all semantic memories for a user."""
    try:
        res = memory_manager.get_all(user_id=user_id)
        return {"success": True, "results": res}
    except Exception as e:
        logger.error(f"Error fetching all memories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/index")
async def index_rag(req: RagIndexRequest):
    """Trigger the indexing of the local workspace folder."""
    try:
        res = rag_indexer.index_workspace(req.workspace_path)
        return {"success": True, "results": res}
    except Exception as e:
        logger.error(f"Error indexing workspace: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/query")
async def search_rag(req: RagQueryRequest):
    """Query the indexed local workspace semantic context."""
    try:
        res = rag_indexer.query(req.query, top_k=req.limit)
        return {"success": True, "results": res}
    except Exception as e:
        logger.error(f"Error querying workspace: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/index_url")
async def index_url_rag(req: RagIndexUrlRequest):
    """Scrape a URL and index its contents directly into the local RAG knowledge base."""
    try:
        from network.playwright_scraper import extract_markdown_from_url
        markdown_text = await extract_markdown_from_url(req.url)
        
        if markdown_text.startswith("Error:"):
            raise Exception(markdown_text)
            
        res = rag_indexer.index_text(markdown_text, metadata={"source": req.url})
        return {"success": True, "results": res}
    except Exception as e:
        logger.error(f"Error indexing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vision/screenshot")
async def get_screenshot():
    """Capture and return the primary screen as a base64 encoded JPEG."""
    try:
        b64 = vision_capturer.capture_base64()
        return {"success": True, "image": b64}
    except Exception as e:
        logger.error(f"Error capturing screen: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/claw/action")
async def execute_claw_action(req: ClawAction):
    """Execute a PyAutoGUI desktop action."""
    try:
        res = claw_executor.execute(req)
        return res
    except Exception as e:
        logger.error(f"Error executing claw action: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/claw/safety")
async def set_safety_tier(req: SafetyRequest):
    """Update the safety tier for the Zero Claw engine."""
    try:
        claw_executor.safety.set_tier(req.tier)
        return {"success": True, "tier": claw_executor.safety.tier.value}
    except Exception as e:
        logger.error(f"Error setting safety tier: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/network/proxy")
async def network_proxy(req: ProxyRequest):
    """Execute a web request through the NEXUS sidecar rules."""
    try:
        res = await fetch_via_proxy(req)
        return res
    except Exception as e:
        logger.error(f"Error executing proxy fetch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/network/scrape")
async def scrape_url(req: ScrapeRequest):
    """Extract clean markdown from a URL using headless Playwright."""
    try:
        # The original `extract_markdown_from_url` was removed from imports,
        # and the instruction implies `scrape_page` is the new function.
        # Assuming `scrape_page` returns the desired result directly.
        res = await scrape_page(req.url)
        return res
    except Exception as e:
        logger.error(f"Error scraping {req.url}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount the MCP Router
app.include_router(mcp_api.router)

if __name__ == "__main__":
    print("\n\n=== REACHED MAIN BLOCK ===")
    print("Starting Uvicorn Server on port 1421...")
    import sys
    sys.stdout.flush()
    uvicorn.run(app, host="127.0.0.1", port=1421)
    print("=== UVICORN EXITED ===")
