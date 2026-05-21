import os
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from dataclasses import dataclass

import json

# Initialize Firebase Admin if not already initialized
if not firebase_admin._apps:
    try:
        env_cred = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if env_cred:
            cred_dict = json.loads(env_cred)
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), "..", "firebase-service-account.json"))
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Failed to initialize Firebase Admin SDK: {e}")

security = HTTPBearer(auto_error=False)

@dataclass
class User:
    uid: str
    email: str
    name: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> User:
    """FastAPI Dependency to get the current authenticated user via Firebase."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated. Missing Bearer Token.")

    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email", "")
        name = decoded_token.get("name", "Unknown User")
        return User(uid=uid, email=email, name=name)
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Security(security)) -> User | None:
    if not credentials:
        return None
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return User(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email", ""),
            name=decoded_token.get("name", "Unknown User")
        )
    except Exception:
        return None
