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

    cleaned_text = speech_cleaning(result["text"])
    
    print("\n--- Transcription Result ---")
    print(cleaned_text)
    print("----------------------------")

def speech_cleaning(text:str) -> str:

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
    
    removal_words = [ "um ", ",", " uh ", " oh ", " you know ", " so ", " actually ", " basically ", " literally ", " I mean ", " right ", " well ", " okay ", " ok ", " hmm ", " huh ", " ah ", " er ", " eh ", " mm ", " y'know ", " you see ", " yeah ", " oops "]

    small_char_text = text.lower()  # Convert to lowercase for uniformity

    for word in removal_words:
        text = small_char_text.replace(word, "")

    # Remove the removal words from the text
    text = ' '.join(text.split())  # Remove extra spaces

    return text    


if __name__ == "__main__":
    # Your specific path
    audio_file = r"your_path\test_audio_2.mp4"  # Replace with the actual path to your audio file
    
    test_transcription(audio_file)