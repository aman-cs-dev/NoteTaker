import os
import whisper
from datetime import datetime
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse
import json
import tempfile


app = FastAPI()

# loads the whisper small model
model = whisper.load_model("small") 

# the endpoint expects a POST request with an audio file (mp3, wav, etc.) and returns the transcribed text.
# then it saves it temporarily, transcribes it using the Whisper model, and returns the text as a JSON response.
# the temporary file is deleted after transcription to free up space.
# this should happen in every 5 minutes, so the frontend can send the audio file every 5 minutes and get the text version back.
@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Run Whisper transcription
    result = model.transcribe(tmp_path)
    text = result["text"]

    # Clean up
    os.remove(tmp_path)

    # returns the text version to frontend
    return JSONResponse({"text": text})