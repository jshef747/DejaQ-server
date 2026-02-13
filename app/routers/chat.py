# server/app/routers/chat.py
import logging
import json
import traceback  # <--- NEW: Crucial for seeing the crash
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.normalizer import NormalizerService

# Setup logger
logger = logging.getLogger("dejaq.router.chat")

router = APIRouter()

# Initialize Service (Global)
print("DEBUG: Initializing Normalizer Service...")
normalizer = NormalizerService()
print("DEBUG: Normalizer Service Ready.")


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