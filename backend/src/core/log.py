import logging
from pathlib import Path

from src.core.config import BASE_DIR

# Ensure the logs directory exists
log_dir = Path(BASE_DIR) / "logs"
log_dir.mkdir(parents=True, exist_ok=True)

# Create a logger
logger = logging.getLogger("core_logger")
logger.setLevel(logging.DEBUG)  # Set to the lowest level you want to capture

# Create a handler
handler = logging.FileHandler(log_dir / "app.log")

# Create a formatter
formatter = error_formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
handler.setFormatter(formatter)

# Add handler to the logger
logger.addHandler(handler)
