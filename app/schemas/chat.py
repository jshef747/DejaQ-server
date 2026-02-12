from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="The ID of the user sending the message")
    message: str = Field(..., description="The content of the message being sent")
    department: str = Field(..., description="The department the message is related to")

class ChatResponse(BaseModel):
    sender: str = Field(..., description="Who sent this message (user/system/bot)")
    message: str = Field(..., description="The content of the response")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field("ok", description="Status of the processing")