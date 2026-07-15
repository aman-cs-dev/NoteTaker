# for chatgpt api
# used for taking notes
#uses structured output
# filters based on userid
# uses course id to filter for course id
# records based on lecture id
# uses 3.5 and 4.0 turbo for notetaking and final summary respectively

from openai import OpenAI
import os
from typing import Annotated, List, Literal, Optional
import openai
from pydantic import BaseModel
from datetime import datetime
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse



app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_key = os.getenv("api_key")


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

class finalsummaryList(BaseModel):
    finalsummary: List[finalsummary]



# sending ai 1000 words from the session
# requesting to make the notes
@app.post("/note-taking")
async def note_taking(request: Request):

    data = await request.json()
    
    meeting_info = data["meeting_info"]
    words = data["words"]
  


    message = f"lecture information: {meeting_info} and lecture words by professor: {words} "

    prompt = (f"You are supposed to take notes of this lecture or meeting with the following information and the summary should be user friendly and "
              f"should include all the important things and anything else which you find is important"
              f"here is all the information you need: \n\n"
              f"{message}\n")
    
 
    client = OpenAI(api_key=api_key)

    try:
        
    # Try the beta parse method for 1.82.0
     response = client.beta.chat.completions.parse(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in making summary, these are the 1000 words from a meeting of the user, you are supposed to make a summary out of it and make helpful notes so that user can focus on the meeting"},
                {"role": "user", "content": prompt}
            ],
            response_format=notesList,
        )
    
     return JSONResponse({"status": "success", "notes": response.model_dump()})

    except Exception as e:
      return JSONResponse({"status": "error", "message": str(e)})

@app.post("final-summary")
async def final_summary(request: Request):
   
   data = await request.json()

   notes = data["notes"]
   meeting_info = data["meeting_info"]

   message = f"lecture information: {meeting_info} and lecture words by professor: {notes} "

   prompt = (f"You are supposed to make a summary of the following notes provided to you, this is from a meeting of lecture based on the information provided to you"
              f"should include all the important things and anything else which you find is important"
              f"here is all the information you need: \n\n"
              f"{message}\n")
   
   client = OpenAI(api_key=api_key)

   try:
        
    # Try the beta parse method for 1.82.0
     response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are an expert in making summary, these are the notes made by the ai agent during the lecture or meeting based on the info, you are supposed to make a proper summary out of it which is super helpful for the user and the user will remember the lecture when the come back to the summary"},
                {"role": "user", "content": prompt}
            ],
            response_format=finalsummaryList,
        )
    
     return JSONResponse({"status": "success", "notes": response.model_dump()})

   except Exception as e:
      return JSONResponse({"status": "error", "message": str(e)})







   









