from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise Exception("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env")

from supabase import create_client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("Loaded SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("Loaded SUPABASE_SERVICE_ROLE_KEY:", os.getenv("SUPABASE_SERVICE_ROLE_KEY")[:8], "...")

