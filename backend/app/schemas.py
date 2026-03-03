from pydantic import BaseModel, EmailStr
from typing import List
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class Config:
    from_attributes = True

class AnswerCreate(BaseModel):
    question_id: int
    selected_option: str

class AssessmentCreate(BaseModel):
    answers: List[AnswerCreate]   