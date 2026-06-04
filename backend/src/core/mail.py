import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
from src.core.config import settings
from src.core.log import logger


class EmailSender:
    def __init__(
        self,
        smtp_server: str,
        smtp_port: int,
        smtp_username: str,
        smtp_password: str,
    ):
        """
        Initialize the EmailSender with SMTP details and login credentials.

        :param smtp_server: SMTP server address (e.g., 'smtp.gmail.com')
        :param smtp_port: SMTP server port (e.g., 587 for TLS)
        :param smtp_username: Email address for SMTP authentication
        :param smtp_password: Password for SMTP authentication
        """
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.smtp_username = smtp_username
        self.smtp_password = smtp_password

    def send_email(
        self,
        to_emails: List[str],
        subject: str = "",
        body: str = "",
        is_html: bool = False,
        attachments: Optional[List[str]] = None,
        from_email: Optional[str] = settings.smtp_default_from_email,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
    ):
        """
        Send an email with the specified details.

        :param from_email: Sender's email address
        :param to_emails: List of recipient email addresses (To)
        :param cc_emails: List of CC recipient email addresses (Optional)
        :param bcc_emails: List of BCC recipient email addresses (Optional)
        :param subject: Email subject
        :param body: Email body content
        :param is_html: Specify whether the body is HTML (default - plain text)
        :param attachments: List of file paths to attach (Optional)
        """
        from_email = from_email or self.smtp_username

        # Create the email message
        msg = MIMEMultipart()
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)
        msg["Cc"] = ", ".join(cc_emails) if cc_emails else ""
        msg["Subject"] = subject

        # Set the email body
        body_part = MIMEText(body, "html" if is_html else "plain")
        msg.attach(body_part)

        # Add attachments if any
        if attachments:
            for file_path in attachments:
                try:
                    with open(file_path, "rb") as f:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f'attachment; filename="{file_path.split("/")[-1]}"',
                        )
                        msg.attach(part)
                except Exception as e:
                    logger.error(
                        f"Error attaching file: {file_path}: {e}", exc_info=True
                    )

        # Combine all recipients
        all_recipients = to_emails + (cc_emails or []) + (bcc_emails or [])

        # Send the email
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.ehlo()

                # Enable TLS when supported by server (e.g., Gmail on 587).
                if server.has_extn("starttls"):
                    server.starttls()
                    server.ehlo()

                username = (self.smtp_username or "").strip()
                password = (self.smtp_password or "").replace(" ", "").strip()
                if username and password:
                    server.login(username, password)

                server.sendmail(from_email, all_recipients, msg.as_string())

                logger.info(f"Email sent successfully to: {all_recipients}.")
        except Exception as e:
            logger.error(f"Failed to send email: {e}", exc_info=True)


email_sender = EmailSender(
    smtp_server=settings.smtp_server,
    smtp_port=settings.smtp_port,
    smtp_username=settings.smtp_username,
    smtp_password=settings.smtp_password,
)


# # Usage example
# email_sender.send_email(
#     from_email="your_email@example.com",  # Optional
#     to_emails=["recipient@example.com"],
#     cc_emails=["cc_recipient@example.com"],  # Optional
#     bcc_emails=["bcc_recipient@example.com"],  # Optional
#     subject="Test Email",
#     body="<h1>This is a test email</h1>",
#     is_html=True,
#     attachments=[
#       "/path/to/attachment1.txt",
#       "/path/to/attachment2.pdf"
#     ]  # Optional
# )
