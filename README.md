201~200~# 🚀 ShareXpress Backend

ShareXpress Backend ek **secure, scalable FastAPI-based authentication system** hai jo modern authentication techniques use karta hai jaise:

- 🔐 Email OTP Authentication
- 🔑 Google OAuth 2.0 Login
- 🪪 JWT Authentication (RS256)
- 🆔 UUID-based User IDs
- 🗄️ MongoDB (Async)
- ✉️ Email-based OTP delivery

Ye backend production-ready architecture follow karta hai aur future scalability ke liye design kiya gaya hai.

---

## 📌 Features

- ✅ Email OTP login & verification
- ✅ Google OAuth login
- ✅ JWT authentication using **RS256 (asymmetric keys)**
- ✅ Secure HTTP-only cookies
- ✅ UUID-based `user_id` (Mongo `_id` expose nahi hota)
- ✅ Async MongoDB (Motor)
- ✅ Clean separation of concerns (routes, controllers, schemas)
- ✅ Secure session handling for OAuth
- ✅ Environment-based configuration

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Backend Framework | FastAPI |
| ASGI Server | Uvicorn |
| Database | MongoDB |
| DB Driver | Motor (Async) |
| Authentication | OTP + Google OAuth |
| Token System | JWT (RS256) |
| Mail Service | FastAPI-Mail |
| OAuth Client | Authlib |
| Sessions | Starlette SessionMiddleware |

---

## 📁 Project Structure




---

## ⚙️ Environment Variables
"""create env file"""
"touch .env"



```env
# Database
MONGO_URI=
DB_NAME=

# JWT (RS256)
JWT_PRIVATE_KEY_PATH=keys/private.pem
JWT_PUBLIC_KEY_PATH=keys/public.pem

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Mail (OTP)
MAIL_USERNAME=
MAIL_PASSWORD=

# GENERATE PUBLIC KEY AND PRIVATE KEY

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem


# CREATE VIRTUAL ENVIRONMENT

python -m venv .venv
source .venv/bin/activate

# INSTALL DEPENDENCIES 

pip install -r requirements.txt


# START AND RUN SERVER

uvicorn main:app

# EXAMPLE URL
http://localhost:8000
