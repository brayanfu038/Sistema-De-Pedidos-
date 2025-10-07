# app/api.py
from fastapi import APIRouter, Depends, HTTPException, status, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
from .db import settings, get_db, Base, engine
from .models import CredentialsDTO, AuthResponseDTO, User
from .security import hash_password, verify_password

router = APIRouter()

@router.post("/createuser", status_code=status.HTTP_204_NO_CONTENT)
def create_user(dto: CredentialsDTO, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.customerid == dto.customerid))
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")
    user = User(customerid=dto.customerid, password_hash=hash_password(dto.password))
    db.add(user)
    db.commit()
    return  # 204 sin body

@router.post("/authuser", response_model=AuthResponseDTO)
def auth_user(dto: CredentialsDTO, db: Session = Depends(get_db)):
    u = db.scalar(select(User).where(User.customerid == dto.customerid))
    ok = bool(u and verify_password(dto.password, u.password_hash))
    return AuthResponseDTO(userCreated=ok)

# ---- crea y exporta la app directamente ----
app = FastAPI(title="LoginMicroservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(router)
