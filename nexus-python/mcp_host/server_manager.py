import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class MCPServerConfig(BaseModel):
    id: str
    name: str
    command: str
    args: List[str]
    env: Dict[str, str] = {}
    is_active: bool = False

class MCPServerInstance:
    def __init__(self, config: MCPServerConfig):
        self.config = config
        self.session: Optional[ClientSession] = None
        self._exit_stack = None
        self._stdio_ctx = None

    async def connect(self):
        try:
            from contextlib import AsyncExitStack
            self._exit_stack = AsyncExitStack()
            
            # Prepare env merging with system env
            env = os.environ.copy()
            env.update(self.config.env)

            server_params = StdioServerParameters(
                command=self.config.command,
                args=self.config.args,
                env=env
            )
            
            # Start the stdio transport
            self._stdio_ctx = stdio_client(server_params)
            read_stream, write_stream = await self._exit_stack.enter_async_context(self._stdio_ctx)
            
            # Create and initialize the session
            self.session = await self._exit_stack.enter_async_context(ClientSession(read_stream, write_stream))
            await self.session.initialize()
            
            self.config.is_active = True
            logger.info(f"Successfully connected to MCP Server: {self.config.name}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MCP Server {self.config.name}: {e}")
            self.config.is_active = False
            await self.disconnect()
            return False

    async def disconnect(self):
        self.config.is_active = False
        if self._exit_stack:
            try:
                await self._exit_stack.aclose()
            except Exception as e:
                logger.error(f"Error closing MCP Server {self.config.name}: {e}")
            finally:
                self._exit_stack = None
                self.session = None

    async def get_tools(self) -> List[Any]:
        if not self.session or not self.config.is_active:
            return []
        try:
            response = await self.session.list_tools()
            return response.tools
        except Exception as e:
            logger.error(f"Error listing tools for {self.config.name}: {e}")
            return []
            
    async def call_tool(self, tool_name: str, arguments: dict) -> Any:
        if not self.session or not self.config.is_active:
            raise RuntimeError(f"Server {self.config.name} is not connected.")
        try:
            result = await self.session.call_tool(tool_name, arguments)
            return result
        except Exception as e:
            logger.error(f"Error calling tool {tool_name} on {self.config.name}: {e}")
            raise

class MCPServerManager:
    def __init__(self, registry_file: str = "mcp_registry.json"):
        self.registry_file = registry_file
        self.servers: Dict[str, MCPServerInstance] = {}
        self._load_registry()

    def _load_registry(self):
        if not os.path.exists(self.registry_file):
            # Seed with an empty list if file doesn't exist
            self._save_registry([])
            return

        try:
            with open(self.registry_file, 'r') as f:
                data = json.load(f)
                for item in data:
                    config = MCPServerConfig(**item)
                    self.servers[config.id] = MCPServerInstance(config)
        except Exception as e:
            logger.error(f"Failed to load MCP registry: {e}")

    def _save_registry(self, configs: List[dict] = None):
        try:
            data_to_save = configs if configs is not None else [
                s.config.dict(exclude={'is_active'}) for s in self.servers.values()
            ]
            with open(self.registry_file, 'w') as f:
                json.dump(data_to_save, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save MCP registry: {e}")

    async def start_all(self):
        """Attempts to connect to all registered servers concurrently."""
        tasks = []
        for instance in self.servers.values():
            tasks.append(instance.connect())
        await asyncio.gather(*tasks)

    async def stop_all(self):
        """Disconnects all active servers."""
        tasks = []
        for instance in self.servers.values():
            if instance.config.is_active:
                tasks.append(instance.disconnect())
        await asyncio.gather(*tasks)

    async def add_server(self, config: MCPServerConfig) -> bool:
        if config.id in self.servers:
            logger.warning(f"Server {config.id} already exists.")
            return False
            
        instance = MCPServerInstance(config)
        self.servers[config.id] = instance
        self._save_registry()
        
        # Immediately try to connect
        return await instance.connect()

    async def remove_server(self, server_id: str) -> bool:
        if server_id not in self.servers:
            return False
            
        instance = self.servers[server_id]
        await instance.disconnect()
        del self.servers[server_id]
        self._save_registry()
        return True

    def get_server_configs(self) -> List[MCPServerConfig]:
        return [s.config for s in self.servers.values()]

    async def get_all_tools(self) -> Dict[str, List[Any]]:
        """Returns a mapping of server_id -> list of tools."""
        all_tools = {}
        for server_id, instance in self.servers.items():
            if instance.config.is_active:
                tools = await instance.get_tools()
                all_tools[server_id] = [
                    {
                        "name": tool.name,
                        "description": tool.description,
                        "inputSchema": tool.inputSchema
                    } for tool in tools
                ]
        return all_tools

    async def call_tool(self, server_id: str, tool_name: str, arguments: dict) -> Any:
        if server_id not in self.servers:
            raise ValueError(f"Server {server_id} not found.")
        return await self.servers[server_id].call_tool(tool_name, arguments)

manager = MCPServerManager(registry_file=os.path.join(os.path.dirname(__file__), "mcp_registry.json"))
