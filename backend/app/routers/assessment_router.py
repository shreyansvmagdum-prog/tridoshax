from fastapi import APIRouter, Depends
from app.questionnaire_config import QUESTIONNAIRE
from app.auth import get_current_user
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas


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
    print("Current user object:", current_user)
    print("Assessment data:", assessment_data)
    print("Answers list:", assessment_data.answers)
    
    new_assessment = models.Assessment(user_id=current_user.id)
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    for ans in assessment_data.answers:
        new_answer = models.Answer(
            assessment_id=new_assessment.id,
            question_id=ans.question_id,
            selected_option=ans.selected_option
        )
        db.add(new_answer)

    db.commit()

    return {"message": "Assessment submitted successfully"}

@router.get("/test-user")
def test_user(current_user = Depends(get_current_user)):
    print("USER INSIDE TEST:", current_user)
    return {"user_id": current_user.id}