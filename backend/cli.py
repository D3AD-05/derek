import typer
from sqlalchemy import select
from src.core.database import get_session
from src.core.security import get_hashed_password
from src.models.user import User, UserStatus

app = typer.Typer()


@app.command("create_user")
def create_user(
    name: str = typer.Option(..., prompt="Enter name"),
    email: str = typer.Option(..., prompt="Enter email"),
    password: str = typer.Option(..., prompt="Enter password", hide_input=True),
    confirm_password: str = typer.Option(
        ..., prompt="Enter password again", hide_input=True
    ),
    is_platform_admin: bool = typer.Option(..., prompt="Platform admin?"),
):
    try:
        # Check if user already exists
        with next(get_session()) as session:
            existing_user = (
                session.query(User).filter(User.email == email.lower()).first()
            )

            if existing_user:
                typer.echo(f"User with email {email} already exists.")
                return

            if confirm_password != password:
                typer.echo("'password' & 'confirm_password' does not match.")
                return

            hashed_password = get_hashed_password(password)
            active_user_status_id = session.scalar(
                select(UserStatus.id).where(UserStatus.code == "active")
            )
            new_user = User(
                name=name,
                email=email.lower(),
                password_hash=hashed_password,
                is_platform_admin=is_platform_admin,
                user_status_id=active_user_status_id,
            )
            session.add(new_user)
            session.commit()
            typer.echo("User created successfully.")
    except Exception as e:
        typer.echo(f"Error creating user: {str(e)}")


if __name__ == "__main__":
    app()
