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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)