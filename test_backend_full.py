import requests
import json
import time
import uuid

BASE_URL = "http://localhost:8001"

def test_full_flow():
    # 1. Create Session (if needed, but we can reuse or fake one)
    session_id = str(uuid.uuid4())
    print(f"Testing with Session ID: {session_id}")

    # 2. Simulate AI Chat Request
    payload = {
        "messages": [{"role": "user", "content": "hi"}],
        "session_id": session_id,
        "model": "gemini-3-flash-preview"
    }

    print("\n--- Sending AI Chat Request ---")
    start_time = time.time()
    try:
        res = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=60)
        latency = time.time() - start_time
        
        print(f"Total Request Latency: {latency:.2f}s")
        print(f"Status Code: {res.status_code}")
        
        if res.status_code == 200:
            print("Response:", res.json())
        else:
            print("Error Response:", res.text)
            
    except Exception as e:
        print(f"Global Timeout or Error: {e}")

if __name__ == "__main__":
    test_full_flow()
