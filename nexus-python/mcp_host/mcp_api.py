import logging
from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from .server_manager import manager, MCPServerConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp", tags=["mcp"])

class InstallServerRequest(BaseModel):
    id: str
    name: str
    command: str
    args: List[str]
    env: Dict[str, str] = {}

class CallToolRequest(BaseModel):
    server_id: str
    tool_name: str
    arguments: dict

@router.on_event("startup")
async def startup_event():
    logger.info("Starting MCP Server Manager...")
    await manager.start_all()

@router.on_event("shutdown")
async def shutdown_event():
    logger.info("Stopping MCP Server Manager...")
    await manager.stop_all()

@router.get("/servers")
async def get_servers():
    configs = manager.get_server_configs()
    return {"success": True, "servers": [c.dict() for c in configs]}

@router.post("/servers")
async def install_server(req: InstallServerRequest):
    config = MCPServerConfig(
        id=req.id,
        name=req.name,
        command=req.command,
        args=req.args,
        env=req.env
    )
    success = await manager.add_server(config)
    if success:
        return {"success": True, "message": f"Server {req.name} installed and connected."}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to install or connect server {req.name}")

@router.delete("/servers/{server_id}")
async def uninstall_server(server_id: str):
    success = await manager.remove_server(server_id)
    if success:
        return {"success": True, "message": f"Server {server_id} removed."}
    else:
        raise HTTPException(status_code=404, detail="Server not found.")

@router.get("/tools")
async def get_all_tools():
    """Returns a flat list of tools from all active servers, prefixed by server_id."""
    raw_tools = await manager.get_all_tools()
    flattened = []
    
    for server_id, tools in raw_tools.items():
        for tool in tools:
            # We prefix the tool name to ensure uniqueness across servers
            # The orchestrator will use this format to call the right server
            prefixed_name = f"{server_id}___{tool['name']}"
            flattened.append({
                "name": prefixed_name,
                "description": f"[{server_id}] {tool['description']}",
                "parameters": tool.get('inputSchema', {})
            })
            
    return {"success": True, "tools": flattened}

@router.post("/call")
async def call_tool(req: CallToolRequest):
    try:
        result = await manager.call_tool(req.server_id, req.tool_name, req.arguments)
        
        # Format the result nicely (ToolResult object from SDK)
        text_content = ""
        is_error = getattr(result, "isError", False)
        
        for item in result.content:
            if item.type == "text":
                text_content += item.text + "\n"
        
        return {"success": not is_error, "content": text_content.strip()}
    except Exception as e:
        logger.error(f"Error calling tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))
