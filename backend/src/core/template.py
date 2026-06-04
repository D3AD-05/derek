from jinja2 import Environment, FileSystemLoader
from src.core.config import APP_DIR


# Register jinja2 templates
# Define paths to multiple template directories
template_dirs = [APP_DIR / "templates"]

# Create a Jinja2 environment with multiple loaders
template_loader = FileSystemLoader(template_dirs)
jinja_env = Environment(loader=template_loader)
