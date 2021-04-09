import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or "secret_string"
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]= "E:\\Griffith\\CPA\\room-locator-e80d4ee86476.json"
    