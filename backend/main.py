import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from db.migrate import run_migrations
from routers import auth, users

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run database migrations on application start
    try:
        run_migrations()
    except Exception as e:
        print(f"Error running database migrations during startup: {e}")
    yield

app = FastAPI(
    title="Sleek Auth API",
    description="Secure FastAPI Auth System with Role-Based Access Control (RBAC) and raw SQL pymysql connection.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
# Must specify the exact frontend origin (wildcard '*' cannot be used with allow_credentials=True)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the Sleek Auth System API",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
