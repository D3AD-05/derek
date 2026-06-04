from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings

# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR = Path(__file__).resolve().parent.parent.parent
APP_DIR = Path(BASE_DIR / "src")


class Settings(BaseSettings):
    env: str = Field(default="dev")
    database_driver: str = Field(default="postgresql")
    database_username: str = Field(default="postgres")
    database_password: str = Field(default="postgres")
    database_host: str = Field(default="localhost")
    database_port: int = Field(default=5432)
    database_name: str = Field(default="appdb")
    secret_key: str = Field(default="highly-secret-key-change-me-in-production")
    algorithm: str = Field(default="HS256")
    access_token_expire_seconds: int = Field(default=86400)
    refresh_token_expire_seconds: int = Field(default=604800)
    web_app_base_url: str = Field(default="http://localhost:5173")
    smtp_server: str = Field(default="smtp.mailtrap.io")
    smtp_port: int = Field(default=2525)
    smtp_username: str
    smtp_password: str
    smtp_default_from_email: str = Field(default="noreply@example.com")

    @property
    def database_url(self) -> str:
        drivername = self.database_driver
        username = self.database_username
        password = quote_plus(self.database_password)
        host = self.database_host
        port = self.database_port
        database = self.database_name

        url = f"{drivername}://{username}:{password}@{host}:{port}/{database}"

        return url

    class Config:
        env_file = BASE_DIR / ".env"  # Specifies the .env file to load


# Instantiate the Settings class to load values from .env
settings = Settings()
