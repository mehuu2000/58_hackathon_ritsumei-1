from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, String, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker

app = FastAPI(title="empathyAPI")

# ===== DB =====
engine = create_engine("sqlite:///./empathy.db", future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

class Empathy(Base):
    __tablename__ = "empathy"
    # 複合主キー（UID + post_id）
    uid = Column(String, primary_key=True)
    post_id = Column(String, primary_key=True)
    __table_args__ = (UniqueConstraint("uid", "post_id", name="uq_uid_post"),)

Base.metadata.create_all(bind=engine)

# ===== Auth（ダミー）=====
def verify_token(h: Optional[str]) -> Optional[str]:
    """Bearer <uid> を許可。実運用ではJWT検証などに差し替え。"""
    if not h:
        return None
    try:
        scheme, token = h.split(" ", 1)
        return token if scheme.lower() == "bearer" and token else None
    except ValueError:
        return None

# ===== Schemas =====
class EmpathyIn(BaseModel):
    post_id: str

class EmpathyOut(BaseModel):
    status: bool  # True=good中, False=解除

# ===== Endpoints =====
@app.post("/empathy", response_model=EmpathyOut)
def toggle_empathy(body: EmpathyIn, authorization: str = Header(...)):
    uid = verify_token(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not body.post_id.strip():
        raise HTTPException(status_code=400, detail="Invalid post_id")

    db = SessionLocal()
    try:
        # 複合PKは get(Model, (pk1, pk2)) で取得する
        rec = db.get(Empathy, (uid, body.post_id))
        if rec:
            db.delete(rec)
            db.commit()
            return EmpathyOut(status=False)
        db.add(Empathy(uid=uid, post_id=body.post_id))
        db.commit()
        return EmpathyOut(status=True)
    finally:
        db.close()

@app.get("/empathy/{post_id}/status", response_model=EmpathyOut)
def get_status(post_id: str, authorization: str = Header(...)):
    uid = verify_token(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = SessionLocal()
    try:
        rec = db.get(Empathy, (uid, post_id))
        return EmpathyOut(status=bool(rec))
    finally:
        db.close()

