import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests

from app.db.database import get_db_connection

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str):
    return pwd_context.verify(password, password_hash)


def create_token(user_id: int, email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, created_at FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@router.post("/signup")
def signup(payload: SignupRequest):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s", (payload.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    cur.execute(
        """
        INSERT INTO users (name, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id, name, email, created_at
        """,
        (payload.name, payload.email, hash_password(payload.password)),
    )

    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "access_token": create_token(user["id"], user["email"]),
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login")
def login(payload: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, email, password_hash, created_at FROM users WHERE email = %s",
        (payload.email,),
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": create_token(user["id"], user["email"]),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
    }


@router.post("/google")
def google_auth(payload: GoogleAuthRequest):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    try:
        info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            google_client_id,
        )

        email = info.get("email")
        name = info.get("name") or email.split("@")[0]

        if not email:
            raise HTTPException(status_code=400, detail="Google email not found")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, email, created_at FROM users WHERE email = %s",
        (email,),
    )
    user = cur.fetchone()

    if not user:
        cur.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, created_at
            """,
            (name, email, hash_password(os.urandom(32).hex())),
        )
        user = cur.fetchone()
        conn.commit()

    cur.close()
    conn.close()

    return {
        "access_token": create_token(user["id"], user["email"]),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
    }


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return current_user
