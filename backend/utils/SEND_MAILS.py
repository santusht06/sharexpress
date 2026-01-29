from fastapi import FastAPI, BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig


from core.config import MAIL_CONFIG


conf = MAIL_CONFIG


async def send_otp_email(email: str, otp: str):
    message = MessageSchema(
        subject="Your Secure One-Time Verification Code",
        recipients=[email],
        body=f"""
            <h2>Verify Your Account</h2>
            <p>Your one-time verification code is:</p>
            <h1><b>{otp}</b></h1>
            <p>This code will expire in 5 minutes.<br>
            For your security, do not share it with anyone.</p>
        """,
        subtype="html",
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    return True
