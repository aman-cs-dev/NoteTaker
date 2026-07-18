import os
import logging
import tempfile


import whisper
from fastapi import FastAPI, Request, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)




app = FastAPI(title="Audio to Speech API", description="API for transcribing audio files to text using Whisper model.", version="1.0.0")

# loads the whisper small model
model = whisper.load_model("small") 


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)) -> JSONResponse:

    """Transcribes an uploaded audio file to text using the Whisper model.
       Then it saves it temporarily, transcribes it using the Whisper model, and returns the text as a JSON response.
       The temporary file is deleted after transcription to free up space.
       This should happen every 5 minutes, so the frontend can send the audio file every 5 minutes and get the text version back.

       Intended for lectures, meetings, and other audio recordings where a text version is needed for note-taking or documentation purposes.

       Args:
           file (UploadFile): The uploaded audio file to be transcribed (mp3, wav, m4a, etc.).

       Returns:
           JSONResponse: A JSON response containing the transcribed text from the audio file.

       Raises:
           HTTPException: If the uploaded file is not a valid audio file or if there is an error during transcription.               
       """
    
    # checks if the uploaded file is an audio file else throws an error
    if file.content_type not in ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file (mp3, wav, m4a, etc.).")
    
    suffix = os.path.splitext(file.filename or "")[1] or ".mp3"
    tmp_path = None
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")
            tmp.write(content)
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)
        cleaned_text = await speech_cleaning(result["text"])
        return JSONResponse(content={"transcribed_text": cleaned_text})

    except Exception as e:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail="Transcription failed") from e

    finally:
        # Always clean up the temp file, even if transcription raised.
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

async def speech_cleaning(text:str) -> str:

    """Cleans the transcribed text by removing unwanted characters, extra spaces, and formatting issues.
       Starts by checking if the input text is empty or None, raising a ValueError if so. 
       Converts the text to small characters for uniformity and removal.
       Then it removes filler words and unnecessary punctuation to create a more readable and structured version of the transcribed text for better comprehension.
       Creates a more readable and structured version of the transcribed text for better comprehension.
       Returns the cleaned and formatted text as a string.


    Args:
        text (str): The transcribed text to be cleaned.    

    returns:
        str: The cleaned and formatted text.

    raises:
        ValueError: If the input text is empty or None.                
    """   
      
    if not text or not text.strip():
            raise ValueError("Input text is empty or None")
    
    removal_words = [ "um ", ",", " uh ", " oh ", " like ", " you know ", " so ", " actually ", " basically ", " literally ", " I mean ", " right ", " well ", " okay ", " ok ", " hmm ", " huh ", " ah ", " er ", " eh ", " mm ", " y'know ", " you see ", " yeah ", " oops "]

    small_char_text = text.lower()  # Convert to lowercase for uniformity

    for word in removal_words:
        text = small_char_text.replace(word, "")

    # Remove the removal words from the text
    text = ' '.join(text.split())  # Remove extra spaces

    return text    


   
    

    