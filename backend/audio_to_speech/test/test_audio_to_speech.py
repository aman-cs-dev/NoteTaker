import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("api_key"))

REMOVAL_WORDS = [
    " um ", " uh ", " oh ", " you know ", " so ", " actually ", " basically ",
    " literally ", " i mean ", " right ", " well ", " okay ", " ok ", " hmm ",
    " huh ", " ah ", " er ", " eh ", " mm ", " y'know ", " you see ", " yeah ", " oops "
]


def speech_cleaning(text: str) -> str:
    if not text or not text.strip():
        raise ValueError("Input text is empty or None")

    cleaned = f" {text.lower()} "  # pad edges so boundary-word matches work at start/end too
    for word in REMOVAL_WORDS:
        cleaned = cleaned.replace(word, " ")

    return " ".join(cleaned.split())  # collapse extra whitespace


def test_transcription(audio_file_path: str):
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found at {audio_file_path}")
        return

    print(f"Transcribing {audio_file_path}...")

    with open(audio_file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=audio_file,
        )

    print("\n--- Raw Transcription ---")
    print(transcript.text)

    cleaned = speech_cleaning(transcript.text)
    print("\n--- Cleaned Transcription ---")
    print(cleaned)
    print("----------------------------")


if __name__ == "__main__":
    audio_file = r"C:\Users\chess\Desktop\misc\my_projects\notetaker\backend\audio_to_speech\test\test_audio_2.mp4"
    test_transcription(audio_file)