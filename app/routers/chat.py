# app/routers/chat.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chat import ChatRequest, ChatResponse
import json

router = APIRouter()


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()

            try:
                payload = json.loads(data)
                request_data = ChatRequest(**payload)
            except Exception as e:
                # FIX: Truncate error message to 100 chars (Protocol limit is 125 bytes)
                error_msg = f"Invalid Schema: {str(e)}"
                safe_reason = (error_msg[:100] + '...') if len(error_msg) > 100 else error_msg

                print(f"Validation Error: {str(e)}")  # Print full error to server console for debugging
                await websocket.close(code=1008, reason=safe_reason)
                break

            response = ChatResponse(
                sender="system",
                message=f"Echo: {request_data.message}",
                status="processed"
            )

            await websocket.send_text(response.model_dump_json())

    except WebSocketDisconnect:
        print("Client disconnected")