from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import uuid
from app.supabase_client import supabase
from gotrue.errors import AuthApiError
from storage3.utils import StorageException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    print("======== upload_csv called ========")

    if not file.filename.endswith(".csv"):
        print(f"[ERROR] Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        print(f"[INFO] Reading file: {file.filename}")
        contents = await file.read()
        print(f"[INFO] File size: {len(contents)} bytes")

        df = pd.read_csv(io.BytesIO(contents))
        print(f"[INFO] DataFrame loaded with shape: {df.shape}")
    except Exception as e:
        print(f"[ERROR] Failed to read CSV: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    filename = f"{uuid.uuid4()}.csv"
    print(f"[INFO] Generated filename: {filename}")

    try:
        print("[INFO] Uploading file to Supabase...")
        res = supabase.storage.from_("datasets").upload(
            path=filename,
            file=contents,
            file_options={"content-type": "text/csv"}
        )
        print(f"[INFO] Upload successful: {res}")
    except StorageException as e:
        print(f"[ERROR] Supabase returned StorageException: {e}")
        raise HTTPException(status_code=500, detail="Supabase returned error during upload")
    except Exception as e:
        print(f"[ERROR] Unexpected Supabase upload error: {e}")
        raise HTTPException(status_code=500, detail="Unknown error during upload")

    try:
        public_url = supabase.storage.from_("datasets").get_public_url(filename)
        print(f"[INFO] Public URL: {public_url}")
    except Exception as e:
        print(f"[ERROR] Failed to get public URL: {e}")
        public_url = None

    schema = {
        "columns": df.columns.tolist(),
        "types": df.dtypes.astype(str).to_dict(),
        "null_counts": df.isnull().sum().to_dict()
    }
    print(f"[INFO] Schema extracted: {schema}")

    preview = df.head(5).to_dict(orient="records")
    print(f"[INFO] Preview generated with {len(preview)} rows")

    return {
        "preview": preview,
        "schema": schema,
        "supabase_url": public_url
    }
