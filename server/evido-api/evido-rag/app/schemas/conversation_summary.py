from typing import List, Optional
from pydantic import BaseModel, Field


class ConversationSummaryMessage(BaseModel):
    role: str
    content: str


class ConversationSummaryRequest(BaseModel):
    oldSummary: Optional[str] = None
    messages: List[ConversationSummaryMessage] = Field(default_factory=list)


class ConversationSummaryResponse(BaseModel):
    summary: str