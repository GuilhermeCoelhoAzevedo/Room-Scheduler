from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, IntegerField
from wtforms.fields.html5 import DateField, TimeField
from wtforms.validators import DataRequired, ValidationError, Length
from application import client

class roomForm(FlaskForm):
    room_number = IntegerField("Room number", validators=[DataRequired()])
    name        = StringField("Name", validators=[DataRequired(), Length(max=20)])
    submit      = SubmitField("Create room")

    def validate_room_number(self, room_number):
        entity_key  = client.key("Room", int(room_number.data))
        room = client.get(entity_key)

        #VALIDATION CHECKING IF THE GPU NAME IS BEING REPEATED
        #VALIDATION CREATED FOR ADD/EDIT GPU
        if room:
            raise ValidationError("Room already exists in the system!")