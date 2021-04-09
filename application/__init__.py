from flask import Flask
from config import Config
from google.cloud import datastore

app = Flask(__name__)
app.config.from_object(Config)

client = datastore.Client()

from application import routes