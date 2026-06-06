from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth, documents, signatures, audit

load_dotenv()

app = FastAPI(title="DotSign API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/api/docs", tags=["Documents"])
app.include_router(signatures.router, prefix="/api/signatures", tags=["Signatures"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])

@app.get("/")
def root():
    return {"message": "DotSign API is running!"}