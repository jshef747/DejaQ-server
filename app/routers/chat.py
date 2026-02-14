# server/app/routers/chat.py
import logging
import json
import traceback  # <--- NEW: Crucial for seeing the crash
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.normalizer import NormalizerService
from app.services.llm_router import LLMRouterService
from app.services.context_adjuster import ContextAdjusterService

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

logger.info("Initializing Context Adjuster Service...")
context_adjuster = ContextAdjusterService()
logger.info("Context Adjuster Service Ready.")


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
    # LLM receives original query to preserve tone — normalized query is for future cache key
    answer = llm_router.generate_response(request.message, complexity="easy")
    logger.info(f"LLM answer length: {len(answer)}")
    # TODO: generalize answer for cache storage when ChromaDB is integrated
    # generalized = context_adjuster.generalize(answer)
    return ChatResponse(
        sender="bot",
        message=answer,
        normalized_query=clean_query,
        status="ok",
    )


@router.post("/generalize", response_model=ChatResponse)
async def generalize_endpoint(request: ChatRequest):
    logger.info(f"POST /generalize from user={request.user_id}")
    generalized = context_adjuster.generalize(request.message)
    logger.info(f"Generalized answer length: {len(generalized)}")
    return ChatResponse(
        sender="system",
        message=generalized,
        normalized_query=request.message,
        status="ok",
    )


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    logger.debug("New WebSocket connection request received.")
    await websocket.accept()
    logger.debug("Connection accepted. Entering loop.")

    try:
        while True:
            # 1. Wait for data
            logger.debug("Waiting for client message...")
            data = await websocket.receive_text()
            logger.debug(f"Received raw data: {data}")

            # 2. Validate
            try:
                payload = json.loads(data)
                request_data = ChatRequest(**payload)
                logger.debug("Validation successful.")
            except Exception as e:
                logger.error(f"Validation FAILED: {e}")
                await websocket.close(code=1008, reason="Invalid Schema")
                break

            # 3. Normalize
            logger.debug("Starting normalization...")
            try:
                clean_query = normalizer.normalize(request_data.message)
                logger.debug(f"Normalization result: {clean_query}")
            except Exception as e:
                logger.error(f"CRASH IN NORMALIZER: {e}")
                traceback.print_exc()
                clean_query = request_data.message  # Fallback

            # 4. Generate LLM response (original query preserves tone)
            logger.debug("Generating LLM response...")
            try:
                answer = llm_router.generate_response(request_data.message, complexity="easy")
                logger.debug(f"LLM answer length: {len(answer)}")
                # TODO: generalize answer for cache storage when ChromaDB is integrated
                # generalized = context_adjuster.generalize(answer)
            except Exception as e:
                logger.error(f"CRASH IN LLM: {e}")
                traceback.print_exc()
                answer = f"I processed your request. Cleaned Query: '{clean_query}'"

            # 5. Send Response
            response = ChatResponse(
                sender="bot",
                message=answer,
                normalized_query=clean_query,
                status="ok"
            )

            await websocket.send_text(response.model_dump_json())
            logger.debug("Response sent.")

    except WebSocketDisconnect:
        logger.debug("Client disconnected gracefully.")
    except Exception as e:
        logger.error(f"CRITICAL UNHANDLED ERROR: {e}")
        traceback.print_exc()


