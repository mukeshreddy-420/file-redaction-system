
from fastapi import APIRouter
from pydantic import BaseModel
from database import cursor, conn

router = APIRouter()

class User(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: User):
    cursor.execute("INSERT INTO users (email,password) VALUES (?,?)",(user.email,user.password))
    conn.commit()
    return {"message":"Signup success"}

@router.post("/login")
def login(user: User):
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?",(user.email,user.password))
    if cursor.fetchone():
        return {"email":user.email}
    return {"error":"Invalid credentials"}
