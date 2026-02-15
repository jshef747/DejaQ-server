from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="The ID of the user sending the message")
    message: str = Field(..., description="The content of the message being sent")
    department_id: str = Field(..., description="The department the message is related to")
    conversation_id: Optional[str] = Field(None, description="ID of the conversation for multi-turn chat")

class ChatResponse(BaseModel):
    sender: str = Field(..., description="Who sent this message (user/system/bot)")
    message: str = Field(..., description="The content of the response")
    normalized_query: Optional[str] = Field(None, description="The normalized version of the user's query")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field("ok", description="Status of the processing")
    cache_hit: Optional[bool] = Field(None, description="Whether the response came from cache")
    conversation_id: Optional[str] = Field(None, description="ID of the conversation for multi-turn chat")
    enriched_query: Optional[str] = Field(None, description="The context-enriched version of the query (shown when enrichment changed the query)")
    cached: Optional[bool] = Field(None, description="Whether this response will be stored in cache")