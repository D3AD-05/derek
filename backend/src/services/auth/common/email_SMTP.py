import logging
from src.core.config import settings
from src.core.mail import email_sender
from src.core.template import jinja_env

logger = logging.getLogger(__name__)


def send_reset_password_email(token: str, to_email: str, name: str):
    """Send password reset email."""
    logger.info(f"Sending reset email to {to_email}")

    base_url = settings.web_app_base_url.rstrip("/")
    reset_password_url = f"{base_url}/#/reset-password?token={token}"

    template = jinja_env.get_template("mail/IAM/reset_password_email.html")
    body = template.render(name=name, reset_password_url=reset_password_url)

    email_sender.send_email(
        to_emails=[to_email],
        subject="Reset password - Derek",
        body=body,
        is_html=True,
    )

    logger.info(f"Reset email queued successfully for {to_email}")

def send_set_password_email(token: str, to_email: str, name: str):
    """Send password set email."""
    logger.info(f"Sending set password email to {to_email}")

    base_url = settings.web_app_base_url.rstrip("/")
    set_password_url = f"{base_url}/#/reset-password?token={token}"

    template = jinja_env.get_template("mail/IAM/set_password_email.html")
    body = template.render(name=name, set_password_url=set_password_url)

    email_sender.send_email(
        to_emails=[to_email],
        subject="Reset password - Derek",
        body=body,
        is_html=True,
    )

    logger.info(f"Reset email queued successfully for {to_email}")
