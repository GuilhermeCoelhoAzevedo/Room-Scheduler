from flask import Flask
from flask_wtf.csrf import CSRFProtect
from config import Config
from google.cloud import datastore

app = Flask(__name__)
app.config.from_object(Config)

csrf = CSRFProtect()
csrf.init_app(app)

client = datastore.Client()

from application import routes