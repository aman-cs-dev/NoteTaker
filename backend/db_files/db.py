# deploys mongodb
# mongodb deployed on railway


# 1 CHUNK - each minute summary of the meeting

# SUMMARY - final summary of the entire meeting

from pymongo import MongoClient
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse


app = FastAPI()

# loads the env file
#REMOVE DURING DEPLOYMENT
load_dotenv()

# gets the URL
MONGO_URI = os.getenv("MONGO_URI")


# CONNECTS TO MONGODB SERVER
client = MongoClient(MONGO_URI)


db = client["ai_note_taker"]
chunk_collection = db["meeting_chunk"]
summary_collection = db["meeting_summary"]


@app.post("/store-chunk")
async def store_every_chunk(request: Request):

    data = await request.json()
    
    # id should included start time, end time, user id and first 2 letters of meeting
    id = data["id"]
    time = data["time"]
    meeting = data["meeting_info"]
    chunk_summary = data["chunk_summary"]

    document = {
        
        "id": id,
        "time": time,
        "meeting": meeting,
        "chunk_summary": chunk_summary
    }
    
    result = await chunk_collection.insert_one(document)
    return ({"status": "yes", "message": "stored!"})

# gets every 5 minute summary
@app.post("/get-chunk")
async def get_meeting_summary(request:Request):

    # REQUESTS FROM FRONTEND
    data = await request.json()
    
    # id should included start time, end time, user id and first 2 letters of meeting
    id = data["id"]
    
    try:
     
     # finds on the basis of id
     cursor = await chunk_collection.find_one({"id":id })

     # creates an empty list to store all the chunks
     chunks = []

     # starts a loop to get every chunk and store
     # make JSON serializable
     async for doc in cursor:
        doc["_id"] = str(doc["_id"])  
        chunks.append(doc)

     if chunks: 
      return JSONResponse({"status":"found", "chunks": chunks})
     
     else:
        return JSONResponse({"status": "none", "message": "not found"})
     
    
    except Exception as e:
       return JSONResponse({"status": "error","message": str(e)})
    

# stores the final summary of the meeting
@app.post("/store-summary")
async def store_meeting_summary(request:Request):
     
    # REQUESTS FROM FRONTEND
    data = await request.json()
    
    # id should included start time, end time, user id and first 2 letters of meeting
    id = data["id"]
    time = data["time"]
    meeting = data["meeting_info"]
    meeting_summary = data["meeting_summary"]

    document = {

        "id": id,
        "time": time,
        "meeting": meeting,
        "meeting_summary": meeting_summary
    }

    result = await chunk_collection.insert_one(document)
    return ({"status": "yes", "message": "stored!"})

@app.post("/get-summary")
async def get_meeting_summary(request:Request):

    # REQUESTS FROM FRONTEND
    data = await request.json()
    
    # id should included start time, end time, user id and first 2 letters of meeting
    id = data["id"]
    
    try:
     
     summary = await summary_collection.find_one({"id":id })

     if summary: 
      return JSONResponse({"status":"found", "summary": summary})
     
     else:
        return JSONResponse({"status": "none", "message": "not found"})
     
    
    except Exception as e:
       return JSONResponse({"status": "error","message": str(e)})
    



   







