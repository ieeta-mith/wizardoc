FROM python:3.12-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory.
WORKDIR /code

# Copy dependency metadata first for better layer caching.
COPY ./pyproject.toml ./uv.lock ./README.md /code/

# Copy application source.
COPY ./src /code/src

# Install application dependencies.
RUN uv sync --no-cache

# Run the application.
CMD ["/code/.venv/bin/fastapi", "run", "src/main.py", "--port", "80", "--host", "0.0.0.0", "--proxy-headers"]
