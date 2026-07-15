FROM python:3.11-slim

# ffmpeg is required by Whisper to decode audio files (mp3, wav, webm, etc.)
# git is required because openai-whisper pulls some deps directly from GitHub.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first so Docker can cache this layer
# and avoid reinstalling on every code change.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY backend/ ./backend/

# Whisper downloads and caches its model weights on first load.
# Pre-downloading here avoids a cold-start delay on the first request
# once deployed, at the cost of a larger image build time.
RUN python -c "import whisper; whisper.load_model('small')"

# Railway (and most PaaS providers) inject the port to bind to via $PORT.
# Default to 8000 for local `docker run` testing.
ENV PORT=8000
EXPOSE 8000

WORKDIR /app/backend/audio_to_speech
CMD ["sh", "-c", "uvicorn audio_to_speech:app --host 0.0.0.0 --port ${PORT}"]
