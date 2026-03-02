from fastapi import APIRouter, Depends
from app.questionnaire_config import QUESTIONNAIRE
from app.auth import get_current_user
from app import models

router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)

@router.get("/questions")
def get_questions(current_user: models.User = Depends(get_current_user)):
    return {"questions": QUESTIONNAIRE}