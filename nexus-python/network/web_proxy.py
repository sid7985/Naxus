from pydantic import BaseModel
from typing import List, Optional
import httpx
import logging
from urllib.parse import urlparse
import json

logger = logging.getLogger(__name__)

class ProxyRequest(BaseModel):
    url: str
    agent_id: str
    mode: str  # 'offline', 'supervised', 'researcher-only', 'online'
    allowed_domains: List[str]
    method: str = "GET"
    headers: Optional[dict] = None
    body: Optional[str] = None

class ProxyResponse(BaseModel):
    success: bool
    status_code: Optional[int] = None
    content: Optional[str] = None
    error: Optional[str] = None
    blocked: bool = False
    reason: Optional[str] = None

def is_domain_allowed(target_domain: str, allowed_domains: List[str]) -> bool:
    """Check if the target domain matches any of the allowed wildcard rules."""
    target_domain = target_domain.lower()
    for rule in allowed_domains:
        rule = rule.lower()
        if rule.startswith("*."):
            suffix = rule[2:]
            if target_domain == suffix or target_domain.endswith("." + suffix):
                return True
        elif target_domain == rule:
            return True
    return False

async def fetch_via_proxy(req: ProxyRequest) -> ProxyResponse:
    """
    Executes an HTTP request if it passes the NEXUS agent internet rules.
    """
    try:
        parsed = urlparse(req.url)
        domain = parsed.netloc.split(":")[0]  # Remove port if present
        
        # 1. Localhost and Local Network (Always allow internal tools)
        if domain in ["localhost", "127.0.0.1", "0.0.0.0", "::1"]:
            pass # Internal is implicitly allowed

        # 2. Check Internet Policies
        elif req.mode == "offline":
            return ProxyResponse(success=False, blocked=True, reason="NEXUS is in Offline Mode. Outbound requests are blocked.")
            
        elif req.mode == "researcher-only":
            if "researcher" not in req.agent_id.lower():
                return ProxyResponse(success=False, blocked=True, reason="NEXUS is in Researcher-Only mode. This agent is blocked.")
                
        elif req.mode == "supervised":
            if not is_domain_allowed(domain, req.allowed_domains):
                return ProxyResponse(success=False, blocked=True, reason=f"Domain {domain} is not in the allowed supervised whitelist.")

        # 3. Execute Request
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.request(
                method=req.method,
                url=req.url,
                headers=req.headers or {},
                content=req.body,
                follow_redirects=True
            )
            
            return ProxyResponse(
                success=True,
                status_code=response.status_code,
                content=response.text
            )

    except httpx.RequestError as e:
        logger.error(f"Proxy request failed: {str(e)}")
        return ProxyResponse(success=False, error=f"Request Failed: {str(e)}")
    except Exception as e:
        logger.error(f"Proxy internal error: {str(e)}")
        return ProxyResponse(success=False, error=str(e))
