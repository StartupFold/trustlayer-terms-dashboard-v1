"""Email service for sending policy acceptance requests via SMTP.

FastMail is initialised lazily on first use so that the app starts even when
email credentials are not configured (the /send endpoint returns 503 instead).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

_mail_client = None
_initialized = False


def _get_mail():
    """Return a FastMail instance, or None if email is not configured."""
    global _mail_client, _initialized
    if _initialized:
        return _mail_client

    _initialized = True
    from app.config import settings

    if not settings.MAIL_FROM or not settings.MAIL_USERNAME:
        _mail_client = None
        return None

    try:
        from fastapi_mail import ConnectionConfig, FastMail

        conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )
        _mail_client = FastMail(conf)
    except Exception:
        _mail_client = None

    return _mail_client


async def send_policy_email(
    recipient_email: str,
    policy_id: int,
    token: str,
    policy_title: str,
) -> None:
    from fastapi import HTTPException, status as http_status

    mail = _get_mail()
    if mail is None:
        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Email service is not configured. "
                "Set MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM in your .env file."
            ),
        )

    from app.config import settings
    from fastapi_mail import MessageSchema, MessageType

    review_url = f"{settings.FRONTEND_URL}/policies/{policy_id}/view?token={token}"
    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #5C6AC4;">Action Required: Policy Review</h2>
      <p>You have been invited to review and accept the following policy:</p>
      <h3 style="color: #333;">{policy_title}</h3>
      <p>Please click the button below to read the full policy and record your acceptance.</p>
      <a href="{review_url}"
         style="display:inline-block; background:#5C6AC4; color:#fff; padding:12px 28px;
                border-radius:6px; text-decoration:none; font-weight:600; margin-top:16px;">
        Review &amp; Accept Policy
      </a>
      <p style="margin-top:32px; color:#888; font-size:13px;">
        If you did not expect this email you can safely ignore it.
      </p>
    </div>
    """
    message = MessageSchema(
        subject=f"Please review and accept: {policy_title}",
        recipients=[recipient_email],
        body=html,
        subtype=MessageType.html,
    )
    await mail.send_message(message)
