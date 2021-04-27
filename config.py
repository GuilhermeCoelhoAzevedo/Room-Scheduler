import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or b'-\xbf\x96OA\xec\xber\\~\xe1\xf1\xa6\x9f\x8d\xddA\xf2\xf6\x8c\xe8n!Z'
    #os.environ["GOOGLE_APPLICATION_CREDENTIALS"]= "E:\\Griffith\\CPA\\room-locator-e80d4ee86476.json"
    