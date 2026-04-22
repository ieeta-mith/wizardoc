FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /code

COPY ./pyproject.toml ./README.md /code/
COPY ./src /code/src
COPY ./config.yaml /code/config.yaml

RUN uv sync --no-cache

CMD ["/code/.venv/bin/fastapi", "run", "src/main.py", "--port", "80", "--host", "0.0.0.0"]
