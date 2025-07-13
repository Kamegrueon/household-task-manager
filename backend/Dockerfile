FROM python:3.12.5-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install uv && uv pip install -r requirements.txt --system

COPY . .

EXPOSE 8000

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh