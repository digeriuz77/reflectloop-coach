from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel

TStructuredOutput = TypeVar("TStructuredOutput", bound=BaseModel)


class LLMClientError(RuntimeError):
    """Raised when an LLM provider call fails or returns unusable output."""


class BaseLLMClient(ABC):
    @abstractmethod
    async def generate_structured_output(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[TStructuredOutput],
    ) -> TStructuredOutput:
        """Generate and validate structured output without exposing provider details."""
