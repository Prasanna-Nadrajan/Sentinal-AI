from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .explain import top_factors_for_prediction
from .model_service import ModelService, payload_to_raw_feature_map, request_to_model_frame
from .schemas import PredictionRequest, PredictionResponse

app = FastAPI(title="Sentinel AI Sepsis API", version="0.1.0")
model_service = ModelService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    model_input = request_to_model_frame(payload)
    probability = model_service.predict_probability(model_input)
    raw_features = payload_to_raw_feature_map(payload)
    top_factors = top_factors_for_prediction(
        model=model_service.model,
        payload=payload,
        probability=probability,
        raw_features=raw_features,
    )
    label = "sepsis" if probability >= 0.5 else "stable"
    return PredictionResponse(
        risk_probability=probability,
        label=label,
        top_factors=top_factors,
    )
