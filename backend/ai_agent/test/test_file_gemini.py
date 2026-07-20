"""
Standalone test script for the Gemini note-taking structured output.

This does NOT start a FastAPI server or hit the /note-taking endpoint over HTTP.
It calls the same Gemini logic directly, with a fake transcript chunk, so you can
confirm the model + structured output schema actually work before wiring this
into the real endpoint.
"""

import os
from typing import List, Optional

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


# --- same schema as in your main ai_agent.py ---
class notes(BaseModel):
    course_name: str
    instructor_name: str
    course_summary: str
    notes: str
    important_points: str
    short_contextual_summary: str


class notesList(BaseModel):
    notes: List[notes]


def test_note_taking():
    # fake data standing in for what the frontend would normally send
    meeting_info = {
        "course_name": "CS3305",
        "instructor_name": "Dr. Smith",
        "course_summary": "Intro to Operating Systems",
    }

    words = (
        "Okay so today we're going to talk about process scheduling. "
        "The operating system has to decide which process runs next on the CPU. "
        "There are a few common algorithms — First Come First Serve, Shortest Job First, "
        "Round Robin, and Priority Scheduling. Round Robin is important because it's used "
        "in most modern time-sharing systems, and you should remember that the assignment "
        "on scheduling is due next Friday."
    )

    message = f"lecture information: {meeting_info} and lecture words by professor: {words} "

    prompt = (
        "You are an expert in making summaries. These are words transcribed from a segment "
        "of a lecture or meeting. Take notes that are user friendly and include all the important "
        "things and anything else you find important. Include a short yet strong contextual summary "
        "of the lecture so far, so the next AI agent knows the full context. Continue the notes "
        "naturally, keeping continuity with what came before.\n\n"
        f"{message}\n"
    )

    print("Sending request to Gemini...\n")

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": notesList,
        },
    )

    parsed: notesList = response.parsed

    print("--- Parsed Structured Output ---")
    for i, note in enumerate(parsed.notes, start=1):
        print(f"\nNote {i}:")
        print(f"  Course: {note.course_name}")
        print(f"  Instructor: {note.instructor_name}")
        print(f"  Course Summary: {note.course_summary}")
        print(f"  Notes: {note.notes}")
        print(f"  Important Points: {note.important_points}")
        print(f"  Short Contextual Summary: {note.short_contextual_summary}")
    print("\n---------------------------------")

    # also show the raw dict, useful for confirming exact shape before saving to Mongo
    print("\n--- Raw model_dump() ---")
    print(parsed.model_dump())


if __name__ == "__main__":
    if not api_key:
        print("Error: GEMINI_API_KEY not found. Check your .env file.")
    else:
        test_note_taking()