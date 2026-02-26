from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        {
            "env_file": ".env",
            "env_ignore_empty": True,
            "extra": "ignore",
        }
    )

    MONGODB_URI: str
    MONGODB_DB_NAME: str = "risktool"
    API_IAM_SERVER_URL: str | None = None


settings = Settings()  # type: ignore
