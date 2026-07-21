# AML Guardian Core

**🚀 Live Demo:** [Click here to view the AML Guardian Dashboard](https://aml-guardian-core.vercel.app)

---

## Overview
A real-time quantitative risk analysis and transaction velocity dashboard designed for internal capital flow monitoring. The system ingests and converts global fiat matrices to a standardized INR metric, utilizing continuous polling to flag systemic anomalies against risk thresholds without relying on external client models.

## Architecture & Tech Stack
* **Frontend UI:** React, Vite, Tailwind CSS (Deployed via Vercel)
* **Backend Engine:** Python, FastAPI, WebSockets, Uvicorn (Deployed via Render)
* **Data Flow:** Secure WebSocket (`wss://`) integration for real-time transaction streaming.