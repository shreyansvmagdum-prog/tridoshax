from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)



class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    answers = Column(Text)  # Store JSON string of questionnaire
    predicted_dosha = Column(String, nullable=True)

    user = relationship("User")