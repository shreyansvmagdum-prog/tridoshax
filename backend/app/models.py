from sqlalchemy import Column, Integer, String ,ForeignKey, DateTime, Float
from app.database import Base
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    
    assessments = relationship("Assessment", back_populates="user")



class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    answers = relationship("Answer", back_populates="assessment")
    result = relationship("Result", back_populates="assessment", uselist=False)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    question_id = Column(Integer)
    selected_option = Column(String)

    assessment = relationship("Assessment", back_populates="answers")

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    
    vata_score = Column(Integer)
    pitta_score = Column(Integer)
    kapha_score = Column(Integer)

    primary_dosha = Column(String)
    secondary_dosha = Column(String)
    confidence = Column(Float)

    assessment = relationship("Assessment", back_populates="result")