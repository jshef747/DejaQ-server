# server/app/routers/chat.py
import logging
import json
import traceback  # <--- NEW: Crucial for seeing the crash
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.normalizer import NormalizerService
from app.services.llm_router import LLMRouterService

# Setup logger
logger = logging.getLogger("dejaq.router.chat")

router = APIRouter()

# Initialize Services (Global)
logger.info("Initializing Normalizer Service...")
normalizer = NormalizerService()
logger.info("Normalizer Service Ready.")

logger.info("Initializing LLM Router Service...")
llm_router = LLMRouterService()
logger.info("LLM Router Service Ready.")


@router.post("/normalize", response_model=ChatResponse)
async def normalize_endpoint(request: ChatRequest):
    logger.info(f"POST /normalize from user={request.user_id}")
    clean_query = normalizer.normalize(request.message)
    logger.info(f"Normalized query: {clean_query}")
    return ChatResponse(
        sender="system",
        message=clean_query,
        normalized_query=clean_query,
        status="ok",
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    logger.info(f"POST /chat from user={request.user_id}")
    clean_query = normalizer.normalize(request.message)
    logger.info(f"Normalized query: {clean_query}")
    answer = llm_router.generate_response(clean_query, complexity="easy")
    logger.info(f"LLM answer length: {len(answer)}")
    return ChatResponse(
        sender="bot",
        message=answer,
        normalized_query=clean_query,
        status="ok",
    )


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    print("DEBUG: New connection request received.")
    await websocket.accept()
    print("DEBUG: Connection accepted. Entering loop.")

    try:
        while True:
            # 1. Wait for data
            print("DEBUG: Waiting for client message...")
            data = await websocket.receive_text()
            print(f"DEBUG: Received raw data: {data}")

            # 2. Validate
            try:
                payload = json.loads(data)
                request_data = ChatRequest(**payload)
                print("DEBUG: Validation successful.")
            except Exception as e:
                print(f"DEBUG: Validation FAILED: {e}")
                await websocket.close(code=1008, reason="Invalid Schema")
                break

            # 3. Normalize (The likely crash point)
            print("DEBUG: Starting normalization...")
            try:
                clean_query = normalizer.normalize(request_data.message)
                print(f"DEBUG: Normalization result: {clean_query}")
            except Exception as e:
                print(f"DEBUG: CRASH IN NORMALIZER: {e}")
                traceback.print_exc()  # This prints the full error to the terminal
                clean_query = request_data.message  # Fallback

            # 4. Send Response
            response = ChatResponse(
                sender="system",
                message=f"I processed your request. Cleaned Query: '{clean_query}'",
                normalized_query=clean_query,
                status="processed"
            )

            await websocket.send_text(response.model_dump_json())
            print("DEBUG: Response sent.")

    except WebSocketDisconnect:
        print("DEBUG: Client disconnected gracefully.")
    except Exception as e:
        print(f"DEBUG: CRITICAL UNHANDLED ERROR: {e}")
        traceback.print_exc()


