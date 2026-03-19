from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "YOUR_SUPER_SECRET_KEY_KEEP_IT_SAFE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # bcrypt max is 72 bytes; truncate safely
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        encoded = encoded[:72]
    return pwd_context.hash(encoded.decode("utf-8", errors="ignore"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)