from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Example request format
class InputData(BaseModel):
    text: str

@app.post("/predict")
def predict(data: InputData):
    # Your AI model logic here
    result = f"AI processed: {data.text}"

    return {
        "result": result
    }
