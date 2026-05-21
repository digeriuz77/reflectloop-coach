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
        self._max_tokens = settings.llm_max_tokens
        self._temperature = settings.llm_temperature
        self._top_p = settings.llm_top_p
        self._top_k = settings.llm_top_k
        self._presence_penalty = settings.llm_presence_penalty
        self._frequency_penalty = settings.llm_frequency_penalty

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
                max_tokens=self._max_tokens,
                temperature=self._temperature,
                top_p=self._top_p,
                extra_body={
                    "top_k": self._top_k,
                    "presence_penalty": self._presence_penalty,
                    "frequency_penalty": self._frequency_penalty,
                },
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
