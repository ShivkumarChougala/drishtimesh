import os
import re
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

USERNAME_RE = re.compile(r"^[a-z0-9_]{3,24}$")


class SignupRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


def normalize_email(email: str) -> str:
    return str(email).strip().lower()


def normalize_username(username: str) -> str:
    return username.strip().lower()


def validate_name(name: str) -> str:
    name = " ".join(name.strip().split())

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must be at least 2 characters",
        )

    if len(name) > 50:
        raise HTTPException(
            status_code=400,
            detail="Name must be 50 characters or fewer",
        )

    return name


def validate_username(username: str) -> str:
    username = normalize_username(username)

    if not USERNAME_RE.fullmatch(username):
        raise HTTPException(
            status_code=400,
            detail=(
                "Username must be 3-24 characters and contain only "
                "lowercase letters, numbers, and underscores"
            ),
        )

    return username


def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain a lowercase letter",
        )

    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain an uppercase letter",
        )

    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain a number",
        )

    if not re.search(r"[^A-Za-z0-9]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain a special character",
        )


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str):
    return pwd_context.verify(password, password_hash)


def create_token(user_id: int, email: str):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def generate_google_username(cur, email: str) -> str:
    base = email.split("@")[0].lower()
    base = re.sub(r"[^a-z0-9_]", "_", base)
    base = re.sub(r"_+", "_", base).strip("_")

    if len(base) < 3:
        base = f"user_{base}" if base else "user"

    base = base[:24]

    candidate = base
    counter = 1

    while True:
        cur.execute(
            "SELECT id FROM users WHERE LOWER(username) = LOWER(%s)",
            (candidate,),
        )

        if not cur.fetchone():
            return candidate

        suffix = f"_{counter}"
        candidate = f"{base[:24 - len(suffix)]}{suffix}"
        counter += 1


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT id, name, username, email, created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )

        user = cur.fetchone()

    finally:
        cur.close()
        conn.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


@router.post("/signup")
def signup(payload: SignupRequest):
    name = validate_name(payload.name)
    username = validate_username(payload.username)
    email = normalize_email(payload.email)

    validate_password(payload.password)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id FROM users WHERE LOWER(email) = LOWER(%s)",
            (email,),
        )

        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )

        cur.execute(
            "SELECT id FROM users WHERE LOWER(username) = LOWER(%s)",
            (username,),
        )

        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Username already taken",
            )

        cur.execute(
            """
            INSERT INTO users (
                name,
                username,
                email,
                password_hash
            )
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, username, email, created_at
            """,
            (
                name,
                username,
                email,
                hash_password(payload.password),
            ),
        )

        user = cur.fetchone()
        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()

    return {
        "access_token": create_token(
            user["id"],
            user["email"],
        ),
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login")
def login(payload: LoginRequest):
    email = normalize_email(payload.email)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                id,
                name,
                username,
                email,
                password_hash,
                created_at
            FROM users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (email,),
        )

        user = cur.fetchone()

    finally:
        cur.close()
        conn.close()

    if not user or not verify_password(
        payload.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "access_token": create_token(
            user["id"],
            user["email"],
        ),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
    }


@router.post("/google")
def google_auth(payload: GoogleAuthRequest):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured",
        )

    try:
        info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            google_client_id,
        )

        email = info.get("email")

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Google email not found",
            )

        email = normalize_email(email)
        name = info.get("name") or email.split("@")[0]
        name = validate_name(name)

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token",
        )

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT id, name, username, email, created_at
            FROM users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (email,),
        )

        user = cur.fetchone()

        if not user:
            username = generate_google_username(cur, email)

            cur.execute(
                """
                INSERT INTO users (
                    name,
                    username,
                    email,
                    password_hash
                )
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, username, email, created_at
                """,
                (
                    name,
                    username,
                    email,
                    hash_password(os.urandom(32).hex()),
                ),
            )

            user = cur.fetchone()
            conn.commit()

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()

    return {
        "access_token": create_token(
            user["id"],
            user["email"],
        ),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
    }


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return current_user
