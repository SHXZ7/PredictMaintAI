import os
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv

from database import users_collection
from models import UserSignup, UserLogin

# Load env variables
load_dotenv()

# ---------------- CONFIG FROM ENV ----------------

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in environment")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- PASSWORD HELPERS ----------------

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# ---------------- JWT HELPERS ----------------

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- ROUTES ----------------

@router.post("/signup")
def signup(user: UserSignup):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    })

    token = create_access_token(data={"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"sub": db_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/protected")
def protected(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello {current_user}"}
