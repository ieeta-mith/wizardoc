import os
from pathlib import Path
from typing import Any

import yaml

_CONFIG_PATH = Path(__file__).parent.parent / "config.yaml"


def _load() -> dict[str, Any]:
    with open(_CONFIG_PATH) as f:
        return yaml.safe_load(f)


_raw = _load()


class _ModelConfig:
    base_url: str = os.environ.get("OLLAMA_BASE_URL", _raw["model"]["base_url"])
    chat_model: str = os.environ.get("OLLAMA_CHAT_MODEL", _raw["model"]["chat_model"])
    embed_model: str = os.environ.get("OLLAMA_EMBED_MODEL", _raw["model"]["embed_model"])
    temperature: float = float(_raw["model"]["temperature"])
    max_tokens: int = int(_raw["model"]["max_tokens"])


class _RetrievalConfig:
    top_k: int = int(_raw["retrieval"]["top_k"])
    context_tokens: int = int(_raw["retrieval"]["context_tokens"])


class _SessionConfig:
    ttl_seconds: int = int(_raw["session"]["ttl_seconds"])


class Config:
    model = _ModelConfig()
    retrieval = _RetrievalConfig()
    session = _SessionConfig()


config = Config()
