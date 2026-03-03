from fastapi import APIRouter, Depends
from app.questionnaire_config import QUESTIONNAIRE
from app.auth import get_current_user
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.scoring_service import calculate_dosha_scores
from app.models import Result
from app.recommendation import generate_recommendations



router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)

@router.get("/questions")
def get_questions(current_user: models.User = Depends(get_current_user)):
    return {"questions": QUESTIONNAIRE}

router = APIRouter(prefix="/assessment", tags=["Assessment"])



@router.post("/submit")
def submit_assessment(
    assessment_data: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1️⃣ Create Assessment
    new_assessment = models.Assessment(user_id=current_user.id)
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    # 2️⃣ Store Answers
    saved_answers = []

    for ans in assessment_data.answers:
        new_answer = models.Answer(
            assessment_id=new_assessment.id,
            question_id=ans.question_id,
            selected_option=ans.selected_option
        )
        db.add(new_answer)
        saved_answers.append(new_answer)

    db.commit()

    # 3️⃣ Calculate Dosha Scores
    scores = calculate_dosha_scores(saved_answers)

    # 4️⃣ Store Result in DB
    result = models.Result(
        assessment_id=new_assessment.id,
        vata_score=scores["vata"],
        pitta_score=scores["pitta"],
        kapha_score=scores["kapha"],
        primary_dosha=scores["primary"],
        secondary_dosha=scores["secondary"],
        confidence=scores["confidence"]
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    # 5️⃣ Return Full Response
    return {
        "message": "Assessment submitted successfully",
        "result": {
            "primary_dosha": result.primary_dosha,
            "secondary_dosha": result.secondary_dosha,
            "vata_score": result.vata_score,
            "pitta_score": result.pitta_score,
            "kapha_score": result.kapha_score,
            "confidence": result.confidence
        }
    }

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1️⃣ Get latest assessment of user
    latest_assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.created_at.desc())
        .first()
    )

    if not latest_assessment:
        return {"message": "No assessment found"}

    # 2️⃣ Get result linked to assessment
    result = (
        db.query(models.Result)
        .filter(models.Result.assessment_id == latest_assessment.id)
        .first()
    )

    if not result:
        return {"message": "Result not found"}

    # 3️⃣ Temporary recommendation logic (we improve later)
    recommendations = generate_recommendations(result.primary_dosha)

    # 4️⃣ Return full dashboard response
    return {
        "user": {
            "name": current_user.name,
            "age": current_user.age,
            "gender": current_user.gender,
            "height_cm": current_user.height_cm,
            "weight_kg": current_user.weight_kg
        },
        "dosha": {
            "primary": result.primary_dosha,
            "secondary": result.secondary_dosha,
            "vata_score": result.vata_score,
            "pitta_score": result.pitta_score,
            "kapha_score": result.kapha_score,
            "confidence": result.confidence
        },
        "recommendations": recommendations
    }


