import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.normalizer import NormalizerService
from app.services.memory_chromaDB import MemoryService
from app.services.classifier import ClassifierService
from app.services.llm_router import LLMRouterService

# Initialize Logger for this specific module
logger = logging.getLogger("dejaq.router.chat")

router = APIRouter()

# Initialize Services
normalizer = NormalizerService()
memory = MemoryService()
classifier = ClassifierService()
llm_router = LLMRouterService()


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_host = websocket.client.host if websocket.client else "unknown"
    logger.info(f"New WebSocket connection established from {client_host}")

    try:
        while True:
            data = await websocket.receive_text()

            # Validation
            try:
                payload = json.loads(data)
                request_data = ChatRequest(**payload)
            except Exception as e:
                error_msg = f"Invalid Schema: {str(e)}"
                logger.warning(f"Validation failed for client {client_host}: {error_msg}")
                safe_reason = (error_msg[:100] + '...') if len(error_msg) > 100 else error_msg
                await websocket.close(code=1008, reason=safe_reason)
                break

            logger.info(f"Processing message from user: {request_data.user_id}")

            # Logic Flow
            clean_query = normalizer.normalize(request_data.message)
            final_answer = memory.check_cache(clean_query)
            source = "cache"

            if not final_answer:
                complexity = classifier.predict_complexity(clean_query)
                final_answer = llm_router.generate_response(clean_query, complexity)
                source = f"model-{complexity}"

            # Response
            response = ChatResponse(
                sender=source,
                message=final_answer,
                status="processed"
            )
            await websocket.send_text(response.model_dump_json())
            logger.debug(f"Response sent to {request_data.user_id} via {source}")

    except WebSocketDisconnect:
        logger.info(f"Client {client_host} disconnected")