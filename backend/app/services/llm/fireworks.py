from openai import APIError, AsyncOpenAI, OpenAIError
from pydantic import ValidationError

from app.core.config import Settings
from app.services.llm.base import BaseLLMClient, LLMClientError, TStructuredOutput

FIREWORKS_OPENAI_COMPATIBLE_BASE_URL = "https://api.fireworks.ai/inference/v1"


class FireworksLLMClient(BaseLLMClient):
    """Fireworks.ai client using the OpenAI-compatible chat completions API."""

    def __init__(self, settings: Settings) -> None:
        if settings.fireworks_api_key is None:
            raise LLMClientError("FIREWORKS_API_KEY is not configured.")

        self._client = AsyncOpenAI(
            api_key=settings.fireworks_api_key.get_secret_value(),
            base_url=FIREWORKS_OPENAI_COMPATIBLE_BASE_URL,
        )
        self._model = settings.llm_model

    async def generate_structured_output(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[TStructuredOutput],
    ) -> TStructuredOutput:
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
        except (APIError, OpenAIError) as exc:
            raise LLMClientError("LLM provider request failed.") from exc

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise LLMClientError("LLM provider returned an empty response.")

        try:
            return output_schema.model_validate_json(raw_content)
        except ValidationError as exc:
            raise LLMClientError("LLM provider returned invalid structured output.") from exc
