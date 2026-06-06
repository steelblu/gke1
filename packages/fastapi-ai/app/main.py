import random
import time
from fastapi import FastAPI, Query

app = FastAPI(title="FastAPI AI Service", version="0.1.0")

PRODUCTS_DB = [
    {"id": "rec-1", "name": "Wireless Bluetooth Headphones", "score": 0.95},
    {"id": "rec-2", "name": "Mechanical Keyboard", "score": 0.88},
    {"id": "rec-3", "name": "Portable SSD 1TB", "score": 0.82},
    {"id": "rec-4", "name": "Ergonomic Office Chair", "score": 0.76},
    {"id": "rec-5", "name": "Smartphone Stand", "score": 0.71},
]


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "fastapi-ai",
        "timestamp": int(time.time() * 1000),
    }


@app.get("/recommend")
def recommend(
    user_id: str = Query(default="anonymous"),
    limit: int = Query(default=3, ge=1, le=10),
):
    random.seed(hash(user_id))
    sampled = random.sample(PRODUCTS_DB, min(limit, len(PRODUCTS_DB)))
    return {
        "user_id": user_id,
        "recommendations": sampled,
        "model": "demo-v1",
    }
