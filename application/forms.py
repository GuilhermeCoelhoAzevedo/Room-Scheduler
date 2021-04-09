from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, IntegerField
from wtforms.fields.html5 import DateField, TimeField
from wtforms.validators import DataRequired, ValidationError, Length
from datetime import datetime
import pytz
from flask import flash
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

class bookingForm(FlaskForm):
    id_hidden     = IntegerField("Id")
    room_number   = IntegerField("Room number")
    dt_start      = DateField("Start date", format='%Y-%m-%d')
    hr_start      = TimeField('Start time', format='%H:%M')
    dt_finish     = DateField("Finish date", format='%Y-%m-%d')
    hr_finish     = TimeField('Finish time', format='%H:%M')
    submit        = SubmitField("Reserve")

    def validate(self):
        result = True

        if not self.dt_start.data:
            errors = list(self.dt_start.errors)
            errors.append("This field is required.")
            errors = tuple(errors)
            self.dt_start.errors = errors

            result = False  

        if not self.dt_finish.data:
            errors = list(self.dt_finish.errors)
            errors.append("This field is required.")
            errors = tuple(errors)
            self.dt_finish.errors = errors

            result = False  

        if not self.hr_start.data:
            errors = list(self.hr_start.errors)
            errors.append("This field is required.")
            errors = tuple(errors)
            self.hr_start.errors = errors

            result = False  

        if not self.hr_finish.data:
            errors = list(self.hr_finish.errors)
            errors.append("This field is required.")
            errors = tuple(errors)
            self.hr_finish.errors = errors

            result = False

        if not result:
            return False

        now         = datetime.now()
        dt_start    = datetime.combine(self.dt_start.data, self.hr_start.data)
        dt_finish   = datetime.combine(self.dt_finish.data, self.hr_finish.data)

        if dt_start < now:
            errors = list(self.dt_start.errors)
            errors.append("Start date in the past is not valid!")
            errors = tuple(errors)
            self.dt_start.errors = errors

            result = False

        if dt_finish < now:
            errors = list(self.dt_finish.errors)
            errors.append("Finish date in the past is not valid!")
            errors = tuple(errors)
            self.dt_finish.errors = errors

            result = False

        if not result:
            return result

        if dt_finish <= dt_start:
            errors = list(self.dt_finish.errors)
            errors.append("Finish date must be greather than start date!")
            errors = tuple(errors)
            self.dt_finish.errors = errors
            
            return False

        entity_key  = client.key("Room", int(self.room_number.data))
        room = client.get(entity_key)

        #VALIDATING IF THERE IS A BOOKING FOR THE CHOSEN DATES
        query = client.query(kind='Booking')
        query.add_filter("Room", "=", room.key)
        bookingData = list(query.fetch())
        
        current_booked  = False
        utc             = pytz.UTC

        for booking in bookingData:
            if booking.key.id == int(self.id_hidden.data):
                continue

            if dt_start.replace(tzinfo=utc) <= booking['dt_start']  <= dt_finish.replace(tzinfo=utc):
                current_booked = True

            if dt_start.replace(tzinfo=utc) <= booking['dt_finish'] <= dt_finish.replace(tzinfo=utc):
                current_booked = True

        if current_booked:
            flash("This room is already booked for the chosen dates!", "danger")

            result = False
            
        return result
            