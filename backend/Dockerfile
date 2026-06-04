FROM python:3.12-slim

# 1. Set the working directory inside the container
WORKDIR /app

# 2. Copy the requirements file from your Mac into the container
# (The first '.' is your Mac's folder, the second '.' is the container's /app folder)
COPY requirements.txt .

# 3. Now that the file exists inside the container, you can install it
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of your backend code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
