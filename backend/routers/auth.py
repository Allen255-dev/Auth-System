import datetime
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from db.database import execute_query
from middleware.schemas import UserRegister, UserLogin, TokenResponse, TokenRefreshRequest, UserResponse
from middleware.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister):
    # Check if username or email exists
    existing = execute_query(
        "SELECT id FROM users WHERE username = %s OR email = %s",
        (user_data.username, user_data.email),
        fetch="one"
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
        
    hashed_pwd = hash_password(user_data.password)
    # Insert new user
    user_id = execute_query(
        "INSERT INTO users (username, email, hashed_password, role) VALUES (%s, %s, %s, %s)",
        (user_data.username, user_data.email, hashed_pwd, "user"),
        commit=True
    )
    
    # Fetch user to return
    user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch="one")
    return user

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, response: Response):
    # Support login via username or email
    user = execute_query(
        "SELECT * FROM users WHERE username = %s OR email = %s",
        (login_data.username_or_email, login_data.username_or_email),
        fetch="one"
    )
    
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
        
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated"
        )
        
    # Generate tokens
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})
    
    # Store refresh token in database
    expires_in_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=expires_in_days)
    expires_at_str = expires_at.strftime('%Y-%m-%d %H:%M:%S')
    
    execute_query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user["id"], refresh_token, expires_at_str),
        commit=True
    )
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=expires_in_days * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, refresh_data: Optional[TokenRefreshRequest] = None):
    # Try to get refresh token from:
    # 1. HttpOnly Cookie
    # 2. JSON Body
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token and refresh_data:
        refresh_token = refresh_data.refresh_token
        
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing"
        )
        
    # Decode refresh token
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    # Check if refresh token is in database
    token_record = execute_query(
        "SELECT * FROM refresh_tokens WHERE token = %s",
        (refresh_token,),
        fetch="one"
    )
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked"
        )
        
    # Check expiration date from db
    expires_at = token_record["expires_at"]
    if isinstance(expires_at, str):
        # Handle SQLite str format
        expires_at = datetime.datetime.strptime(expires_at, '%Y-%m-%d %H:%M:%S')
        
    # Force timezone naive comparison or aware comparison
    # Since datetime.now(timezone.utc) is timezone aware, let's make it timezone naive for comparison if needed, or vice-versa.
    # Let's convert expires_at to timezone aware
    if isinstance(expires_at, datetime.datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
            
    now = datetime.datetime.now(datetime.timezone.utc)
    if now > expires_at:
        # Delete expired token
        execute_query("DELETE FROM refresh_tokens WHERE id = %s", (token_record["id"],), commit=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )
        
    # Fetch user
    user = execute_query("SELECT * FROM users WHERE id = %s", (token_record["user_id"],), fetch="one")
    if not user or not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated"
        )
        
    # Token Rotation: Generate new access and refresh tokens
    new_access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    new_refresh_token = create_refresh_token(data={"sub": user["username"]})
    
    # Delete old refresh token
    execute_query("DELETE FROM refresh_tokens WHERE id = %s", (token_record["id"],), commit=True)
    
    # Store new refresh token
    expires_in_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    new_expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=expires_in_days)
    new_expires_at_str = new_expires_at.strftime('%Y-%m-%d %H:%M:%S')
    
    execute_query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user["id"], new_refresh_token, new_expires_at_str),
        commit=True
    )
    
    # Update HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=expires_in_days * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, response: Response, refresh_data: Optional[TokenRefreshRequest] = None):
    # Get refresh token
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token and refresh_data:
        refresh_token = refresh_data.refresh_token
        
    if refresh_token:
        # Delete from database
        execute_query("DELETE FROM refresh_tokens WHERE token = %s", (refresh_token,), commit=True)
        
    # Clear cookie
    response.delete_cookie(key="refresh_token", path="/")
    return {"detail": "Successfully logged out"}
