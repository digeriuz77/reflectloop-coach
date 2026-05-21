from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "ReflectLoop Coach API"
    environment: str = "local"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    llm_provider: str = "fireworks"
    llm_model: str = "accounts/fireworks/models/qwen3p6-plus"
    llm_max_tokens: int = 4000
    llm_temperature: float = 0.6
    llm_top_p: float = 1.0
    llm_top_k: int = 40
    llm_presence_penalty: float = 0.0
    llm_frequency_penalty: float = 0.0
    fireworks_api_key: SecretStr | None = None
    coach_access_token: SecretStr | None = None

    @property
    def allowed_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_local(self) -> bool:
        return self.environment.strip().lower() in {"local", "development", "dev"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
