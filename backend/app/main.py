from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth_router
from app.routers import assessment_router
import app.models



app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)

app.include_router(assessment_router.router)

@app.get("/")
def root():
    return {"message": "Backend Working"}