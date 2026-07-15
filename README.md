# NoteTaker

An AI-powered lecture/meeting note-taker. NoteTaker listens to a live lecture or online meeting, transcribes speech to text in real time, and uses AI to generate structured, searchable notes you can come back to later — without you having to write anything down during class.

## How it works

1. **Capture** — the frontend records audio from either:
   - a microphone (in-person lectures), or
   - shared tab/system audio (Zoom, Google Meet, Teams calls)
2. **Chunking** — every 5 minutes, the recorded audio chunk is sent to the backend.
3. **Transcription** — the backend runs the chunk through [OpenAI Whisper](https://github.com/openai/whisper) to convert speech to text.
4. **Summarization** — the transcribed text, along with context (class name, professor, class time, description), is sent to an AI agent (OpenAI / Gemini) which returns a **structured summary**:
   - a short summary of the chunk
   - key points (if any)
   - important dates mentioned (if any, otherwise `null`)
5. **Storage** — each chunk's transcript + structured summary is saved to MongoDB, tagged with the lecture session, timestamp, and class metadata.
6. **Final synthesis** — once the lecture/meeting ends, all chunk summaries are combined and sent to the AI agent one more time to generate a single **concluding summary** for the whole session, which is also saved.
7. **Recall** — users can come back at any time and browse past lectures by class/date to review notes.

## Architecture

```
 ┌─────────────┐     every 5 min      ┌────────────────┐
 │  Frontend    │ ───────────────────▶│ /transcribe     │
 │ (mic / tab   │   audio chunk       │ (FastAPI +      │
 │  audio)      │                     │  Whisper)       │
 └─────────────┘                      └───────┬─────────┘
                                               │ transcribed text
                                               ▼
                                       ┌────────────────┐
                                       │ AI Agent        │
                                       │ (OpenAI/Gemini) │
                                       │ structured       │
                                       │ summary output   │
                                       └───────┬─────────┘
                                               │
                                               ▼
                                       ┌────────────────┐
                                       │   MongoDB       │
                                       │ (chunks, final  │
                                       │  summary)       │
                                       └────────────────┘
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React / Next.js (planned) |
| Backend | Python, FastAPI |
| Speech-to-text | OpenAI Whisper (`small` model) |
| Summarization | OpenAI API and/or Gemini API |
| Database | MongoDB |
| Deployment | Docker → Railway |

## Project structure

```
notetaker/
├── backend/
│   ├── audio_to_speech/
│   │   └── audio_to_speech.py    # /transcribe endpoint (Whisper)
│   ├── ai_agent/
│   │   └── ai_agent.py           # summarization + structured output logic
│   └── db_files/
│       └── db.py                 # MongoDB connection + save/query helpers
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.11+
- [FFmpeg](https://ffmpeg.org/) installed and available on your system PATH (required by Whisper to decode audio)
- A MongoDB instance (local or Atlas) and connection string
- An OpenAI and/or Gemini API key

## Local setup

```bash
# clone the repo
git clone https://github.com/aman-cs-dev/NoteTaker.git
cd NoteTaker

# create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# source venv/bin/activate    # macOS/Linux

# install dependencies
pip install -r requirements.txt

# copy env template and fill in your keys
cp .env.example .env
```

Create a `.env` file (not committed to git) with:

```
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

Run the transcription service locally:

```bash
cd backend/audio_to_speech
uvicorn audio_to_speech:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

## API

### `POST /transcribe`

Transcribes an uploaded audio chunk to text using Whisper.

**Request:** `multipart/form-data` with an audio file (`mp3`, `wav`, `m4a`, `webm`, etc.)

**Response:**
```json
{
  "text": "transcribed speech from this chunk..."
}
```

More endpoints (summarization, session save, session retrieval) are planned — see Roadmap below.

## Roadmap

- [x] Whisper transcription endpoint working locally
- [x] FFmpeg + environment issues resolved
- [ ] AI agent structured-summary endpoint (chunk-level: summary, key points, important dates)
- [ ] MongoDB schema + save/query logic for lecture sessions
- [ ] End-of-session final summary generation
- [ ] Frontend: mic capture (in-person) + tab audio capture (online meetings)
- [ ] Frontend: dashboard to browse past lectures by date/class
- [ ] Auth (so only you can see your own notes)
- [ ] Dockerize + deploy backend to Railway
- [ ] Async/background processing for transcription (avoid blocking on concurrent chunks)

## Data model (planned)

```json
{
  "lecture_id": "uuid",
  "class_name": "CS3305 - Operating Systems",
  "professor": "Dr. Smith",
  "description": "Lecture on process scheduling",
  "start_time": "2026-07-15T10:00:00Z",
  "chunks": [
    {
      "time_range": "0-5 min",
      "transcript": "...",
      "summary": "...",
      "key_points": ["...", "..."],
      "important_dates": [{ "date": "...", "context": "..." }]
    }
  ],
  "final_summary": "..."
}
```

## Notes

This project is under active development and evolving as features are built out — this README will be kept up to date as the architecture solidifies.
