import bcrypt


# Function to hash a payload using bcrypt
def get_hash(payload: str) -> str:
    payload_bytes = payload.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_payload = bcrypt.hashpw(password=payload_bytes, salt=salt)

    return hashed_payload.decode("utf-8")


# Function to verify hash
def verify_hash(plain_payload: str, hashed_payload: str) -> bool:
    payload_byte_enc = plain_payload.encode("utf-8")
    hashed_payload_enc = hashed_payload.encode("utf-8")

    return bcrypt.checkpw(password=payload_byte_enc, hashed_password=hashed_payload_enc)


# Hash password
def get_hashed_password(password: str) -> str:
    return get_hash(password)


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return verify_hash(plain_password, hashed_password)
