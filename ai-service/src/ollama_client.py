import json
from typing import AsyncIterator

import httpx

from src.config import config


class OllamaError(Exception):
    pass


class OllamaClient:
    def __init__(self) -> None:
        self._base_url = config.model.base_url

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(base_url=self._base_url, timeout=120.0)

    async def embed(self, text: str) -> list[float]:
        async with self._client() as client:
            response = await client.post(
                "/api/embeddings",
                json={"model": config.model.embed_model, "prompt": text},
            )
            if response.status_code != 200:
                raise OllamaError(f"Embedding failed: {response.text}")
            return response.json()["embedding"]

    async def chat(self, messages: list[dict]) -> str:
        """Non-streaming chat — returns the full assistant reply."""
        async with self._client() as client:
            response = await client.post(
                "/api/chat",
                json={
                    "model": config.model.chat_model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": config.model.temperature,
                        "num_predict": config.model.max_tokens,
                    },
                },
            )
            if response.status_code != 200:
                raise OllamaError(f"Chat failed: {response.text}")
            return response.json()["message"]["content"]

    async def chat_stream(self, messages: list[dict]) -> AsyncIterator[str]:
        """Streaming chat — yields content tokens as they arrive."""
        async with self._client() as client:
            async with client.stream(
                "POST",
                "/api/chat",
                json={
                    "model": config.model.chat_model,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": config.model.temperature,
                        "num_predict": config.model.max_tokens,
                    },
                },
            ) as response:
                if response.status_code != 200:
                    raise OllamaError(f"Chat stream failed: {response.status_code}")
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    data = json.loads(line)
                    token = data.get("message", {}).get("content", "")
                    if token:
                        yield token
                    if data.get("done"):
                        break


ollama = OllamaClient()
