import whisper
import os

def test_transcription(audio_file_path):
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found at {audio_file_path}")
        return

    print("Loading model... (this may take a few seconds)")
    model = whisper.load_model("small")
    
    print(f"Transcribing {audio_file_path}...")
    result = model.transcribe(audio_file_path)
    
    print("\n--- Transcription Result ---")
    print(result["text"])
    print("----------------------------")

if __name__ == "__main__":
    # Your specific path
    audio_file = r"file_path\to\your\audio_file.mp3"  # Replace with the actual path to your audio file
    
    test_transcription(audio_file)