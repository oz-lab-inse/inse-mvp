import os
import google.generativeai as genai
import time

api_key = "AIzaSyA63y0OXc_JoOSu4ra7yPFhBf-9sJL-z78"
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-1.5-flash") # Test with a known good model first
    start = time.time()
    response = model.generate_content("Say hello")
    latency = time.time() - start
    print(f"Success! Latency: {latency:.2f}s")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
