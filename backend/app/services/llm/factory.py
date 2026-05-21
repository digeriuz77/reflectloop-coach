from app.core.config import Settings
from app.services.llm.base import BaseLLMClient, LLMClientError
from app.services.llm.fireworks import FireworksLLMClient


def build_llm_client(settings: Settings) -> BaseLLMClient:
    provider = settings.llm_provider.strip().lower()
    if provider == "fireworks":
        return FireworksLLMClient(settings)

    raise LLMClientError(f"Unsupported LLM_PROVIDER: {settings.llm_provider}")
