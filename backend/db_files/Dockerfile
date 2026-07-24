FROM python:3.11-slim

WORKDIR /app

COPY requirements-db.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/db_files/ ./backend/db_files/

ENV PORT=8000
EXPOSE 8000

WORKDIR /app/backend/db_files
CMD ["sh", "-c", "uvicorn db:app --host 0.0.0.0 --port ${PORT}"]
