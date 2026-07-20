import asyncio
import random
import json
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AML Detection Core Engine")

# Enable CORS for React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated ML Risk Engine logic
def analyze_transaction_risk(amount: float, origin_geo: str, dest_geo: str) -> float:
    base_risk = random.uniform(1.0, 15.0)
    
    # High-risk anomaly triggers
    if amount > 10000.0:
        base_risk += random.uniform(30.0, 50.0)
    if origin_geo != dest_geo:
        base_risk += random.uniform(15.0, 35.0)
        
    return min(round(base_risk, 1), 99.9)

@app.get("/")
async def health_check():
    return {"status": "AML Detection Engine Online", "system": "Active"}

# Real-Time WebSocket Data Stream Pipeline
@app.websocket("/ws/transactions")
async def websocket_transaction_stream(websocket: WebSocket):
    await websocket.accept()
    countries = ["US", "GB", "IN", "SG", "DE", "KY", "CH", "AE"]
    
    try:
        while True:
            # Generate simulated real-time transaction event
            tx_id = f"TX-{random.randint(100000, 999999)}"
            amount = round(random.uniform(50.0, 15000.0), 2)
            origin = random.choice(countries)
            dest = random.choice(countries)
            
            risk_score = analyze_transaction_risk(amount, origin, dest)
            
            payload = {
                "id": tx_id,
                "amount": amount,
                "origin": origin,
                "dest": dest,
                "risk_score": risk_score,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            
            # Broadcast payload over WebSocket connection
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(1.5)  # Stream frequency: new event every 1.5 seconds
            
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket stream.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)