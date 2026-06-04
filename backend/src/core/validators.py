def not_empty(value: str) -> str:
    if not value or value.strip() == "":
        raise ValueError("This field cannot be empty.")
    return value
