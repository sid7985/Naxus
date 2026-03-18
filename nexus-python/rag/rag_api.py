import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .indexer import rag_indexer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["rag"])

class IndexRequest(BaseModel):
    path: str

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

@router.post("/index")
async def index_workspace(req: IndexRequest):
    try:
        result = rag_indexer.index_workspace(req.path)
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"Error indexing workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
async def query_rag(req: QueryRequest):
    try:
        results = rag_indexer.query(req.query, req.top_k)
        return {"success": True, "results": results}
    except Exception as e:
        logger.error(f"Error querying RAG: {e}")
        raise HTTPException(status_code=500, detail=str(e))
