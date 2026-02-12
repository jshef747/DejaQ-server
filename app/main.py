from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat
from app.utils.logger import setup_logging
import logging

# 1. Setup Global Logging
setup_logging()
logger = logging.getLogger("dejaq.main")

# 2. Initialize App
app = FastAPI(title="DejaQ Middleware", version="0.1.0")

# 3. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include Routers
app.include_router(chat.router)

@app.on_event("startup")
async def startup_event():
    logger.info("DejaQ Middleware starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("DejaQ Middleware shutting down...")

@app.get("/health")
async def health_check():
    logger.debug("Health check requested")
    return {"status": "ok", "service": "DejaQ Middleware"}