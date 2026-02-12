from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat

# 1. Initialize the App
app = FastAPI(title="DejaQ Middleware", version="0.1.0")

# 2. Configure CORS (Cross-Origin Resource Sharing)
# This is crucial for local development. It allows your 'file://' or 'localhost' frontend
# to connect to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include Routers
# We register the chat router we created in Step 3.
app.include_router(chat.router)

# 4. Health Check Endpoint
# A standard HTTP endpoint to verify the server is running.
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DejaQ Middleware"}