import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from db.database import execute_query, is_sqlite
from middleware.schemas import UserResponse, UserUpdate
from middleware.dependencies import get_current_user, get_admin_user
from middleware.security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/list", response_model=List[UserResponse])
def list_users(admin_user: dict = Depends(get_admin_user)):
    users = execute_query("SELECT * FROM users ORDER BY id DESC", fetch="all")
    return users

@router.put("/update/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    # Check if target user exists
    target_user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch="one")
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Permission check: own profile OR admin
    is_admin = current_user.get("role") == "admin"
    if current_user.get("id") != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this profile"
        )
        
    update_fields = []
    params = []
    
    if user_update.email is not None:
        # Check if email is already taken
        existing = execute_query("SELECT id FROM users WHERE email = %s AND id != %s", (user_update.email, user_id), fetch="one")
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already in use")
        update_fields.append("email = %s")
        params.append(user_update.email)
        
    if user_update.password is not None:
        update_fields.append("hashed_password = %s")
        params.append(hash_password(user_update.password))
        
    # Admin-only fields check
    if user_update.role is not None:
        if not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can change roles")
        if user_update.role not in ["admin", "user"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role. Must be 'admin' or 'user'")
        update_fields.append("role = %s")
        params.append(user_update.role)
        
    if user_update.is_active is not None:
        if not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can activate/deactivate accounts")
        # Prevent self deactivation
        if current_user.get("id") == user_id and not user_update.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrators cannot deactivate themselves")
        update_fields.append("is_active = %s")
        params.append(user_update.is_active)
        
    if not update_fields:
        return target_user
        
    # Add updated_at timestamp
    update_fields.append("updated_at = %s")
    params.append(datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S'))
    
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
    params.append(user_id)
    
    execute_query(query, tuple(params), commit=True)
    
    updated_user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch="one")
    return updated_user

@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, admin_user: dict = Depends(get_admin_user)):
    # Check if user exists
    user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch="one")
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Prevent self-deletion
    if admin_user.get("id") == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrators cannot delete themselves")
        
    execute_query("DELETE FROM users WHERE id = %s", (user_id,), commit=True)
    return {"detail": "User deleted successfully"}
