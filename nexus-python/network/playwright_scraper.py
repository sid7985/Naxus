from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import markdownify
import logging

logger = logging.getLogger(__name__)

async def extract_markdown_from_url(url: str) -> str:
    """
    Uses Playwright to navigate to a URL, extract the page content, 
    parse it with BeautifulSoup to remove clutter, and convert to Markdown.
    """
    try:
        async with async_playwright() as p:
            # specifically use chromium
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            # Navigate and wait for network idle to catch SPA renders
            response = await page.goto(url, wait_until="networkidle", timeout=15000)
            
            if not response or not response.ok:
                logger.error(f"Failed to fetch {url}: {response.status if response else 'No response'}")
                await browser.close()
                return f"Error: Unable to load page (Status: {response.status if response else 'Unknown'})"

            html_content = await page.content()
            await browser.close()

            # Clean and parse HTML
            soup = BeautifulSoup(html_content, 'html.parser')

            # Remove noisy elements
            for el in soup(["script", "style", "nav", "footer", "iframe", "noscript", "aside"]):
                el.decompose()

            clean_html = str(soup.body) if soup.body else str(soup)
            
            # Convert to Markdown
            markdown_content = markdownify.markdownify(clean_html, heading_style="ATX").strip()
            
            # Basic cleanup of extra blank lines
            clean_md = "\n".join([line for line in markdown_content.splitlines() if line.strip() != ""])
            
            return clean_md

    except Exception as e:
        logger.error(f"Scraping error on {url}: {str(e)}")
        return f"Error extracting content: {str(e)}"
