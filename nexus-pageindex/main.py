import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pageindex
from pydantic import BaseModel
import fitz  # PyMuPDF

app = FastAPI(title="NEXUS PageIndex Service")

# Allow CORS for the NEXUS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    tree_data: dict

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NEXUS PageIndex"}

@app.post("/api/index-document")
async def index_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        # Ensure Ollama URL is available
        ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        model_name = os.environ.get("OPENAI_MODEL_NAME", "llama3") # Default local model
        
        # Override OpenAI base URL to point to local Ollama instance
        os.environ["OPENAI_API_BASE"] = ollama_base_url
        # PageIndex expects OPENAI_API_KEY to be set, even if dummy for Ollama
        if "OPENAI_API_KEY" not in os.environ:
            os.environ["OPENAI_API_KEY"] = "ollama"

        # Initialize LLM config for PageIndex
        # PageIndex uses openai python package under the hood
        
        # We need to process the PDF to text first
        doc = fitz.open(temp_pdf_path)
        pages = []
        for i in range(len(doc)):
            page = doc.load_page(i)
            text = page.get_text("text")
            pages.append([text])
            
        print(f"Extracted {len(pages)} pages from {file.filename}")

        # The pageindex library has a complex internal API, 
        # let's try to use the high-level API if available
        # This is a basic implementation placeholder that needs to be refined based on actual library usage
        try:
            tree = {"message": "PageIndex processing would happen here, simulating tree generation."}
            # The actual call would look something like this depending on their exact API:
            # tree = await pageindex.page_index.generate_tree_structure(pages, model=model_name)
        except Exception as e:
            print(f"Error calling pageindex: {e}")
            tree = {"error": str(e)}

        os.unlink(temp_pdf_path)
        return {"filename": file.filename, "tree": tree}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query-tree")
async def query_tree(request: QueryRequest):
    # This would simulate traversing the tree to answer the query
    # based on the PageIndex tree search methodology
    return {
        "answer": f"Simulated answer for query: '{request.query}' based on reasoning over the document tree.",
        "nodes_visited": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
