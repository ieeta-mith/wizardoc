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
    API_DEV_MODE: bool = False
    API_DEV_USER_ID: str = "dev-user"
    API_DEV_USERNAME: str = "dev"
    API_DEV_EMAIL: str = "dev@example.com"
    API_DEV_IS_ADMIN: bool = True


settings = Settings()  # type: ignore
