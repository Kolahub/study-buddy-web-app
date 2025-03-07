# Package initialization file
from flask import Flask
from flask_cors import CORS

# Create the Flask app
app = Flask(__name__)
CORS(app)

# This ensures the api directory is treated as a Python package
# and provides the app instance to other modules 