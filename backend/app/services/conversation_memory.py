"""
cybershield-ai Phase 4
Conversation Memory Engine

Purpose
-------
Stores recent conversations between two users so the AI can
understand context instead of analysing every message independently.

Current storage:
    In-memory (fast)

Future:
    Redis
    SQLite
    PostgreSQL
without changing the public API.
"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, field
from threading import Lock
from datetime import datetime
from typing import Deque, Dict, List


# ============================================================
# CONFIGURATION
# ============================================================

MAX_CONVERSATIONS = 1000
MAX_MESSAGES_PER_CONVERSATION = 50
REPEAT_WINDOW = 10


# ============================================================
# DATA MODEL
# ============================================================

@dataclass
class ConversationMessage:
    sender: str
    receiver: str
    text: str

    timestamp: datetime = field(
        default_factory=datetime.utcnow
    )

    toxic: bool = False

    intent: str = "unknown"

    sentiment: str = "UNKNOWN"

    emotion: str = "unknown"

    sarcasm: bool = False


# ============================================================
# MEMORY ENGINE
# ============================================================

class ConversationMemory:

    def __init__(self):

        self.lock = Lock()

        self.memory: Dict[
            str,
            Deque[ConversationMessage]
        ] = defaultdict(
            lambda: deque(
                maxlen=MAX_MESSAGES_PER_CONVERSATION
            )
        )

    # --------------------------------------------------------

    @staticmethod
    def conversation_id(
        user1: str,
        user2: str
    ) -> str:
        """
        Returns the same ID regardless of order.

        Tom + Jerry

        ==

        Jerry + Tom
        """

        users = sorted([user1, user2])

        return f"{users[0]}::{users[1]}"

    # --------------------------------------------------------

    def add_message(
        self,
        sender: str,
        receiver: str,
        text: str,
        toxic: bool = False,
        intent: str = "unknown",
        sentiment: str = "UNKNOWN",
        emotion: str = "unknown",
        sarcasm: bool = False,
    ):

        cid = self.conversation_id(
            sender,
            receiver
        )

        message = ConversationMessage(
            sender=sender,
            receiver=receiver,
            text=text,
            toxic=toxic,
            intent=intent,
            sentiment=sentiment,
            emotion=emotion,
            sarcasm=sarcasm,
        )

        with self.lock:

            self.memory[cid].append(message)

            # Remove oldest conversation if memory grows too large
            if len(self.memory) > MAX_CONVERSATIONS:

                oldest = next(iter(self.memory))

                del self.memory[oldest]

    # --------------------------------------------------------

    def get_recent_messages(
        self,
        sender: str,
        receiver: str,
        limit: int = 10,
    ) -> List[ConversationMessage]:

        cid = self.conversation_id(
            sender,
            receiver
        )

        with self.lock:

            history = list(self.memory[cid])

        return history[-limit:]

    # --------------------------------------------------------

    def toxic_count(
        self,
        sender: str,
        receiver: str,
        window: int = REPEAT_WINDOW,
    ) -> int:

        history = self.get_recent_messages(
            sender,
            receiver,
            window
        )

        return sum(
            1
            for message in history
            if message.toxic
        )

    # --------------------------------------------------------

    def sarcasm_count(
        self,
        sender: str,
        receiver: str,
        window: int = REPEAT_WINDOW,
    ) -> int:

        history = self.get_recent_messages(
            sender,
            receiver,
            window
        )

        return sum(
            1
            for message in history
            if message.sarcasm
        )

    # --------------------------------------------------------

    def last_message(
        self,
        sender: str,
        receiver: str,
    ):

        history = self.get_recent_messages(
            sender,
            receiver,
            1
        )

        if history:

            return history[0]

        return None

    # --------------------------------------------------------

    def clear_conversation(
        self,
        sender: str,
        receiver: str,
    ):

        cid = self.conversation_id(
            sender,
            receiver
        )

        with self.lock:

            if cid in self.memory:

                del self.memory[cid]


# ============================================================
# GLOBAL INSTANCE
# ============================================================

conversation_memory = ConversationMemory()
