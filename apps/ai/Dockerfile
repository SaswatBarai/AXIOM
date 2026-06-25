FROM python:3.11-slim AS base
WORKDIR /app
COPY apps/ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS runner
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app
COPY apps/ai/main.py ./main.py
COPY apps/ai/utils/ ./utils/
COPY apps/ai/services/ ./services/
COPY apps/ai/routes/ ./routes/
COPY apps/ai/models/ ./models/
COPY apps/ai/data/ ./data/
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
