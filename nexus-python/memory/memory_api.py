import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .mem0_client import memory_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/memory", tags=["memory"])

class AddMemoryRequest(BaseModel):
    user_id: str
    content: str
    agent_id: Optional[str] = "nexus_system"

class SearchMemoryRequest(BaseModel):
    user_id: str
    query: str
    agent_id: Optional[str] = None
    limit: int = 5

@router.post("/add")
async def add_memory(req: AddMemoryRequest):
    try:
        res = memory_manager.add_memory(req.user_id, req.content, req.agent_id)
        return {"success": True, "res": res}
    except Exception as e:
        logger.error(f"Error adding memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_memory(req: SearchMemoryRequest):
    try:
        results = memory_manager.search_memory(req.user_id, req.query, req.agent_id, req.limit)
        return {"success": True, "results": results}
    except Exception as e:
        logger.error(f"Error searching memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    try:
        memory_manager.delete_memory(memory_id)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all/{user_id}")
async def get_all_memories(user_id: str):
    try:
        results = memory_manager.get_all(user_id)
        return {"success": True, "results": results}
    except Exception as e:
        logger.error(f"Error getting all memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))
