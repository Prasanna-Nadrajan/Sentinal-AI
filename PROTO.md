# Sentinel AI - Sepsis Prediction Dashboard

Professional full-stack sepsis risk dashboard with local feature-level clinical reasons for each prediction.

## What is implemented

- **FastAPI backend** serving `POST /predict` and `GET /health`
- **Model-backed risk scoring** using `EarlySepsisPrediction-master/sepsis_rf_model.joblib`
- **Local explanation output** (`top_factors`) with SHAP-first strategy and fallback scoring
- **React dashboard** with:
  - Sepsis probability gauge
  - Insight card beside gauge
  - Threshold-based alerting using a shadcn-style `Alert` component
  - `lucide-react` icons for key vitals
  - Dark, minimalist industrial UI styling

## Project layout

- `backend/app/main.py` - FastAPI app and endpoints
- `backend/app/schemas.py` - request/response models
- `backend/app/model_service.py` - model loading + prediction input mapping
- `backend/app/explain.py` - local feature importance + reason formatting
- `frontend/src/App.tsx` - dashboard shell
- `frontend/src/components/VitalsInputForm.tsx` - vitals form
- `frontend/src/components/RiskGauge.tsx` - risk gauge
- `frontend/src/components/InsightCard.tsx` - alert insight card
- `frontend/src/components/ui/alert.tsx` - shadcn-style alert component
- `frontend/src/lib/api.ts` - API client

## Backend setup

1. Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run API:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at `http://localhost:8000/docs`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

Optional API base URL override:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

## API contract

### `POST /predict`

Request body:

```json
{
  "gender": 0,
  "heart_rate": 110,
  "temperature_c": 39,
  "age": 67,
  "oxygen_saturation": 89,
  "sbp": 92,
  "map": 62,
  "dbp": 55,
  "respiratory_rate": 26,
  "fio2": 32,
  "glucose": 168,
  "unit1": 1,
  "unit2": 0,
  "wbc": 14.6,
  "iculos": 18,
  "hosp_adm_time": -8
}
```

Response body:

```json
{
  "risk_probability": 0.69,
  "label": "sepsis",
  "top_factors": [
    "Low Oxygen Saturation (64 %)",
    "High Temperature (42.5 C)",
    "High WBC (31.1 K/uL)"
  ]
}
```

## UI alert behavior

- **If risk >= 0.5**
  - Alert title: `Clinical Warning Signs`
  - Variant: red/amber warning
  - Content: top 3 local risk drivers

- **If risk < 0.5**
  - Alert title: `Patient Stability Markers`
  - Variant: green success
  - Content: top 3 stability markers

## Smoke-test results

Validated from backend calls:

- High-risk sample: `risk_probability=0.69`, `label=sepsis`
- Low-risk sample: `risk_probability=0.11`, `label=stable`

Both responses returned exactly 3 clinical factor strings.
