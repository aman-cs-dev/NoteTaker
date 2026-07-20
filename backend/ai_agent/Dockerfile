
FROM python:3.11-slim
 
WORKDIR /app
 
# Install dependencies first so Docker can cache this layer
# and avoid reinstalling on every code change.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
 
# Copy the rest of the application code
COPY backend/ ./backend/
 
# Railway (and most PaaS providers) inject the port to bind to via $PORT.
# Default to 8000 for local `docker run` testing.
ENV PORT=8000
EXPOSE 8000
 
WORKDIR /app/backend/audio_to_speech
CMD ["sh", "-c", "uvicorn audio_to_speech:app --host 0.0.0.0 --port ${PORT}"]