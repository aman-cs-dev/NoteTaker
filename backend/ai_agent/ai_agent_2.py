# for gemini api
# used for taking notes
#uses structured output
# filters based on userid
# uses course id to filter for course id
# records based on lecture id
# uses 3.5 and 4.0 turbo for notetaking and final summary respectively

from google import genai
import os
from dotenv import load_dotenv
from typing import Annotated, List, Literal, Optional
from pydantic import BaseModel
from datetime import datetime
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Load your .env file
load_dotenv()

# 2. Get the key from your environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 3. Pass the key to the client (or rename your .env variable to GOOGLE_API_KEY and use genai.Client())
client = genai.Client(api_key=GEMINI_API_KEY)

#stuctured output for realtime notetaking
# for every 1000 words
class notes(BaseModel):
    course_name: str
    instructor_name: str
    course_summary: str
    notes: str
    important_points: str

# structured output called from note-taking endpoint
class notesList(BaseModel):
    notes: List[notes]

# strcutured output for final summary
class finalsummary(BaseModel):
    course_name: str
    instructor_name: str
    course_summary: str
    final_summary: str
    important_points_to_note: Optional[str]
    short_contextual_summary: str  # 1-2 line compressed summary, fed into the NEXT chunk's prompt

class finalsummaryList(BaseModel):
    finalsummary: List[finalsummary]
    
# sending ai 1000 words from the session
# requesting to make the notes
@app.post("/note-taking")
async def note_taking(request: Request):

    """Endpoint for taking notes from a lecture or meeting.
       Accepts JSON data containing meeting information and words spoken during the session.
       Constructs a prompt for the AI to generate structured notes based on the provided information.
       Uses the OpenAI API to generate notes in a structured format, ensuring continuity with previous notes.
       Returns the generated notes as a JSON response.
       
       Args:
           request (Request): The incoming request containing meeting information and words spoken.
       
       Returns:
           JSONResponse: A JSON response containing the generated notes.

       Raises:
              Exception: If there is an error during the note-taking process, an error message is returned in the JSON response.    
       """
    
    data = await request.json()
    
    # meeting info includes course name, instructor name, and course summary
    meeting_info = data["meeting_info"]
    words = data["words"]
  


    message = f"lecture information: {meeting_info} and lecture words by professor: {words} "

    prompt = (f"You are supposed to take notes of this lecture or meeting with the following information and the summary should be user friendly "
              f"You are an expert in making summary, these are the 1000 words from a meeting of the user."
              f"should include all the important things and anything else which you find is important, please make sure to include all the key points and add a short yet strong contexual summary of the lecture till now as well so the next ai agent knows the full context till now"
              f"Continue the notes naturally, keeping continuity with what came before."
              f"here is all the information you need: \n\n"
              f"{message}\n")
    try:
        # 4. Use the correct method and model name
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt ,
            config={
        "response_mime_type": "application/json",
        "response_schema": notesList,
    },
)
        parsed: notesList = response.parsed
        



        return JSONResponse(content={"status": "success", "notes": parsed.model_dump()}, status_code=200)
    
    except Exception as e:
      return JSONResponse({"status": "error", "message": str(e)})
    
@app.post("/final-summary")
async def final_summary(request: Request):
   
   """Endpoint for generating a final summary of a lecture or meeting.
      Accepts JSON data containing notes and meeting information.
      Constructs a prompt for the AI to generate a final summary based on the provided notes and meeting information.
      Uses the OpenAI API to generate a final summary in a structured format.
      Returns the generated final summary as a JSON response.
      
      Args:
          request (Request): The incoming request containing notes and meeting information.
      
      Returns:
          JSONResponse: A JSON response containing the generated final summary.
      
      Raises:
          Exception: If there is an error during the final summary generation process, an error message is returned in the JSON response.
    """
   
   data = await request.json()

   notes = data["notes"]
   meeting_info = data["meeting_info"]

   message = f"lecture information: {meeting_info} and lecture words by professor: {notes} "

   prompt = (f"You are supposed to make a summary of the following notes provided to you, this is from a meeting of lecture based on the information provided to you"
              f"should include all the important things and anything else which you find is important"
              f"here is all the information you need: \n\n"
              f"{message}\n")

   try:
       # 4. Use the correct method and model name
       response = client.models.generate_content(
           model="gemini-3.1-flash-lite",
           contents=prompt ,
           config={
        "response_mime_type": "application/json",
        "response_schema": finalsummaryList,
    },
)
       parsed: finalsummaryList = response.parsed
       
       

       return JSONResponse(content={"final_summary": parsed.model_dump()}, status_code=200) 

   except Exception as e:
      return JSONResponse({"status": "error", "message": str(e)})



