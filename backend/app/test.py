from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

print("Using Supabase URL:", SUPABASE_URL)
print("Using Service Role Key:", SUPABASE_SERVICE_ROLE_KEY[:10] + "...")  # partial key print for safety

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

with open("test.csv", "rb") as f:
    data = f.read()

try:
    res = supabase.storage.from_("datasets").upload("test-upload.csv", data)
    print("Upload response:", res)
except Exception as e:
    print("Error uploading file:", e)
