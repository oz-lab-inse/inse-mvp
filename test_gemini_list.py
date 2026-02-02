import os
import google.generativeai as genai

api_key = "AIzaSyA63y0OXc_JoOSu4ra7yPFhBf-9sJL-z78"
genai.configure(api_key=api_key)

print("Listing models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
            
    test_model = "gemini-3-flash-preview"
    print(f"\nTesting {test_model}:")
    model = genai.GenerativeModel(test_model)
    response = model.generate_content("Hi")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
