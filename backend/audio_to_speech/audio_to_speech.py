from openai import OpenAI
import os
import openai
import whisper
from datetime import datetime
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse
import json
import tempfile


app = FastAPI()

# loads the whisper small model
model = whisper.load_model("small") 


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