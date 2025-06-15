from fastapi import FastAPI, File, UploadFile
import pandas as pd
import io

app = FastAPI()

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    preview = df.head(100).to_dict(orient="records")
    schema = {
        "columns": list(df.columns),
        "types": df.dtypes.apply(lambda x: str(x)).to_dict(),
        "null_counts": df.isnull().sum().to_dict()
    }
    return {"preview": preview, "schema": schema}
