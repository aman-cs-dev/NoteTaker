#deploys mongodb
# mongodb deployed on railway


# 1 CHUNK - each minute summary of the meeting

# SUMMARY - final summary of the entire meeting

from pymongo import MongoClient
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient


app = FastAPI()

# loads the env file
#REMOVE DURING DEPLOYMENT
load_dotenv()

# gets the URL
MONGO_URI = os.getenv("MONGO_URI")


# CONNECTS TO MONGODB SERVER
client = AsyncIOMotorClient(MONGO_URI)


db = client["ai_note_taker"]
chunk_collection = db["meeting_chunk"]
summary_collection = db["meeting_summary"]


@app.post("/store-chunk")
async def store_every_chunk(request: Request):

    """"
    Stores every 5 minute summary of the meeting in the database. 
    This is useful for long meetings where you want to keep track of the discussion in smaller chunks.
    Each chunk is stored with an ID that includes the start time, end time, user ID, and the first two letters of the meeting name. 
    The chunk summary is also stored for easy retrieval later.

    Asynchronous function that handles the POST request to store a chunk of meeting summary in the database.
    It expects a JSON payload in the request body with the following structure:

    Args:
        request (Request): The incoming HTTP request containing the JSON payload.

    Returns:
        JSONResponse: A JSON response indicating the status of the operation. 
                      If successful, it returns a status of "yes" and a message "stored!".
                      If an error occurs, it returns a status of "error" and an error message.

    Raises:
        Exception: If there is an error during the database operation, an error message is returned in the JSON response.                                        

    """

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
async def get_meeting_chunks(request:Request):

    """
    Retrieves every 5 minute summary of the meeting from the database.
    This is useful for long meetings where you want to keep track of the discussion in smaller chunks
    Returns a JSON response containing the status of the operation and the retrieved chunks if found.
    Creates a cursor to find documents in the chunk_collection based on the provided ID, and iterates through the cursor to collect all matching chunks.
    If chunks are found, they are returned in the response; otherwise, a message indicating that no chunks were found is returned.

    Args:
        request (Request): The incoming HTTP request containing the JSON payload with the ID of the meeting.

    Returns:
        JSONResponse: A JSON response indicating the status of the operation. 
                      If chunks are found, it returns a status of "found" and the retrieved chunks.
                      If no chunks are found, it returns a status of "none" and a message "not found".
                      If an error occurs, it returns a status of "error" and an error message.

    Raises:
        Exception: If there is an error during the database operation, an error message is returned in the JSON response.                                                              
    """

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

    """
    Stores the final summary of the meeting in the database.
    This is useful for long meetings where you want to keep track of the overall discussion and conclusions
    Returns a JSON response indicating the status of the operation.
    Creates a document containing the meeting ID, time, meeting information, and the final summary, and inserts it into the summary_collection.

    Args:
        request (Request): The incoming HTTP request containing the JSON payload with the meeting summary.

    Returns:
        JSONResponse: A JSON response indicating the status of the operation. 
                      If successful, it returns a status of "yes" and a message "stored!".
                      If an error occurs, it returns a status of "error" and an error message.

    Raises:
        Exception: If there is an error during the database operation, an error message is returned in the JSON response.                                                                                    
    """
     
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

    result = await summary_collection.insert_one(document)
    return ({"status": "yes", "message": "stored!"})

@app.post("/get-summary")
async def get_meeting_summary(request:Request):

    """
    Retrieves the final summary of the meeting from the database.
    This is useful for long meetings where you want to keep track of the overall discussion and conclusions
    Returns a JSON response containing the status of the operation and the retrieved summary if found.
    Creates a cursor to find the document in the summary_collection based on the provided ID, and retrieves the matching summary.
    If a summary is found, it is returned in the response; otherwise, a message indicating that no summary was found is returned.

    Args:
        request (Request): The incoming HTTP request containing the JSON payload with the ID of the meeting.

    Returns:
        JSONResponse: A JSON response indicating the status of the operation. 
                      If a summary is found, it returns a status of "found" and the retrieved summary.
                      If no summary is found, it returns a status of "none" and a message "not found".
                      If an error occurs, it returns a status of "error" and an error message.

    Raises:
        Exception: If there is an error during the database operation, an error message is returned in the JSON response.                                                                                                              
    """

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
    



   







