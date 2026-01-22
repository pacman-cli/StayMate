import requests

email = "mpuspo2310304@bscse.uiu.ac.bd"
# Trying "password" as a common default for test seeds/manual entry
password = "password"
url = "http://localhost:8080/api/auth/login"

try:
    print(f"Attempting login for {email}...")
    r = requests.post(url, json={"email": email, "password": password})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Login SUCCESS")
        print(f"Token: {r.json().get('accessToken')[:20]}...")
    else:
        print(f"Login FAILED: {r.text}")
except Exception as e:
    print(f"Error: {e}")
