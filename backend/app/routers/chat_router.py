from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app import models

from app.rag.chatbot_ollama import ask_llm

router = APIRouter(prefix="/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)   # 🔥 enable personalization
):
    # =============================
    # 1️⃣ Get latest assessment
    # =============================

    latest_assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.created_at.desc())
        .first()
    )

    user_context = ""

    if latest_assessment:
        result = (
            db.query(models.Result)
            .filter(models.Result.assessment_id == latest_assessment.id)
            .first()
        )

        if result:
            user_context = f"""
User Profile:
Name: {current_user.name}
Age: {current_user.age}
Gender: {current_user.gender}
Height: {current_user.height_cm} cm
Weight: {current_user.weight_kg} kg

Ayurvedic Constitution:
Primary Dosha: {result.primary_dosha}
Secondary Dosha: {result.secondary_dosha}
Confidence: {result.confidence}%
"""

    # =============================
    # 2️⃣ Build final prompt
    # =============================

    final_prompt = f"""
You are an Ayurvedic wellness assistant.

Use the user's health profile if relevant.

{user_context}

User Question:
{request.message}
"""

    # =============================
    # 3️⃣ Call RAG + LLM
    # =============================

    answer = ask_llm(final_prompt)

    return ChatResponse(reply=answer)