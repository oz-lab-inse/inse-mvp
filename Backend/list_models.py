
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

try:
    print("Available Flash models:")
    for m in genai.list_models():
        if 'flash' in m.name.lower():
            print(f" - {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
