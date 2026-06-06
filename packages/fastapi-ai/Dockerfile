# =============================================================================
# Stage 1: Build (Python dependencies)
# =============================================================================
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry for dependency management
RUN pip install --no-cache-dir poetry==1.8

# Cache dependencies layer
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root --only main

# =============================================================================
# Stage 2: Run (Python slim)
# =============================================================================
FROM python:3.12-slim

RUN addgroup --system fastapi && adduser --system --ingroup fastapi fastapi

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY app app

RUN chown -R fastapi:fastapi /app

USER fastapi

EXPOSE 8000

ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
