from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas
from app.auth import hash_password
from app.auth import verify_password, create_access_token
from app.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        age=user.age,
        gender=user.gender,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user



@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/m")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "age": current_user.age,
        "gender": current_user.gender,
        "height_cm": current_user.height_cm,
        "weight_kg": current_user.weight_kg
    }

@router.put("/update-profile")
def update_profile(
    profile_data: schemas.UpdateProfile,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    user = db.query(models.User).filter(models.User.id == current_user.id).first()

    if profile_data.name is not None:
        user.name = profile_data.name

    if profile_data.age is not None:
        user.age = profile_data.age

    if profile_data.gender is not None:
        user.gender = profile_data.gender

    if profile_data.height_cm is not None:
        user.height_cm = profile_data.height_cm

    if profile_data.weight_kg is not None:
        user.weight_kg = profile_data.weight_kg

    db.commit()

    return {
        "message": "Profile updated successfully",
        "user": {
            "name": user.name,
            "age": user.age,
            "gender": user.gender,
            "height_cm": user.height_cm,
            "weight_kg": user.weight_kg
        }
    }