from pydantic import BaseModel
from typing import List

class MessageInput(BaseModel):
    messages: List[str]