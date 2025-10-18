import os

from application import app, client, google
from flask import Flask, render_template, request, session, url_for, redirect, flash, json, jsonify
from application.forms import roomForm, bookingForm
from datetime import datetime
import pytz

from authlib.integrations.flask_client import OAuth
from google.cloud import datastore

@app.route("/")
@app.route("/index")
def index():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    query   = client.query(kind='Room')
    room    = query.fetch()

    return render_template('index.html', index=True, roomData=room)

@app.route("/login", methods=['GET', 'POST'])
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route("/authorize")
def authorize():
    token = google.authorize_access_token()

    # Pass the nonce stored in the session to verify the ID token
    user_info = google.parse_id_token(token, nonce=session.get('nonce'))

    # STORE USER SESSION
    session['email'] = user_info['email']

    # CHECK IF USER EXISTS
    query = client.query(kind='User')
    query.add_filter("email", "=", session['email'])
    userData = list(query.fetch())

    if not userData:
        # CREATE USER ENTITY
        user = datastore.Entity(key=client.key('User'))
        user.update({'email': session['email']})
        client.put(user)
        session['id'] = user.key.id
    else:
        for user in userData:
            session['id'] = user.key.id

    flash(f"{session['email']}, you are successfully logged in!", "success")
    return redirect(url_for("index"))

@app.route("/logout")
def logout():
    session.clear()  # Clear all session data

    # Redirect to Google logout
    google_logout = 'https://accounts.google.com/Logout'
    return redirect(google_logout)

@app.route("/room", methods=['GET', 'POST'])
def room():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))
    
    form = roomForm()

    #INSERT ROOM IN THE DATABASE
    if form.validate_on_submit():
        id      = int(form.room_number.data)
        name    = form.name.data.strip()
        user    = client.key("User", session.get('id'))
        
        room    = datastore.Entity(key = client.key('Room', id))

        room.update({
            'name' : name,
            'User' : user
        }) 

        client.put(room)

        flash(f"{str(id)} - {name}, was successfully included!", "success")
        
        return redirect(url_for('index'))

    return render_template('room.html', room=True, form=form)

@app.route("/bookings", methods=['GET', 'POST'])
def bookings():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    #AJAX FOR BOOKINGS FILTERS
    if request.method == 'POST':
        if request.is_json:
            filters = request.get_json(force=True)

            booking_list    = []
            query           = client.query(kind='Booking')
            query.order     = ["-dt_start", "-dt_finish"]
            utc             = pytz.UTC

            #FILTERING ROOM
            if filters["room_number"]:
                entity_key  = client.key("Room", int(filters["room_number"]))
                query.add_filter("Room", "=", entity_key)

            #FILTERING UER
            if filters["user_bookings"]:
                entity_key  = client.key("User", int(session['id']))
                query.add_filter("User", "=", entity_key)

            bookingData = query.fetch()

            for booking in bookingData:
                #FILTERING START DATE
                if filters["dt_start"]:
                    dt_start = datetime.strptime(filters["dt_start"], '%Y-%m-%d').replace(tzinfo=utc)
                    if booking['dt_start'] < dt_start:
                        continue
                
                #FILTERING FINISH DATE
                if filters["dt_finish"]:
                    dt_finish = datetime.strptime(filters["dt_finish"]+" 23:59:59", '%Y-%m-%d %H:%M:%S').replace(tzinfo=utc)
                    if booking['dt_finish'] > dt_finish:
                        continue
                
                user = client.get(booking['User'])

                if user.key.id == session['id']:
                    same_user = True
                else:
                    same_user = False

                room        = client.get(booking['Room'])
                dt_start    = booking['dt_start'].strftime("%d/%m/%Y %H:%M:%S")
                dt_finish   = booking['dt_finish'].strftime("%d/%m/%Y %H:%M:%S")
                booking_list.append([room.key.id, room['name'], dt_start, dt_finish, str(booking.key.id), user['email'], same_user])
                
            results = json.dumps(booking_list)

            return results

    #GETTING BOOKING DATA
    query       = client.query(kind='Booking')
    query.order = ["-dt_start", "-dt_finish"]
    
    #BRING JUST USER BOOKINGS
    entity_key  = client.key("User", int(session['id']))
    query.add_filter("User", "=", entity_key)
    
    bookingData = list(query.fetch())
    
    for element in bookingData:
        element['User'] = client.get(element['User'])
        element['Room'] = client.get(element['Room'])
        element['dt_start'] = element['dt_start'].strftime("%d/%m/%Y %H:%M:%S")
        element['dt_finish'] = element['dt_finish'].strftime("%d/%m/%Y %H:%M:%S")

    return render_template('bookings.html', bookings=True, bookingData=bookingData)

@app.route("/newBooking/<roomNumber>", methods=['GET', 'POST'])
def newBooking(roomNumber):
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    entity_key  = client.key("Room", int(roomNumber))
    room        = client.get(entity_key)

    if not room:
        return redirect(url_for("index"))

    form                    = bookingForm()
    form.room_number.data   = room.key.id
    form.id_hidden.data     = "0"
    title                   = "New booking: Room " + str(room.key.id) + ' - ' + room['name']

    #INSERT ROOM IN THE DATABASE
    if form.validate_on_submit():
        dt_start    = form.dt_start.data
        dt_finish   = form.dt_finish.data
        hr_start    = form.hr_start.data
        hr_finish   = form.hr_finish.data
        user        = client.key("User", session.get('id'))

        booking = datastore.Entity(key = client.key('Booking'))
        
        booking.update({
            'dt_start' : datetime.combine(dt_start, hr_start),
            'dt_finish' : datetime.combine(dt_finish, hr_finish),
            'Room' : room.key,
            'User' : user
        })

        client.put(booking)

        flash(f"Booking in the room {str(room.key.id)} was successfully included!", "success")
        
        return redirect(url_for('bookings'))

    return render_template('booking.html', form=form, title=title)

@app.route("/deleteBooking", methods=['POST'])
def deleteBooking():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    id = request.form['id']

    entity_key  = client.key("Booking", int(id))
    booking     = client.get(entity_key)
    user        = client.get(booking['User'])

    #CHECK IF THE BOOKING BELONGS TO THE LOGGED USER
    if user.key.id == session['id']:
        client.delete(entity_key)
        flash("Booking was successfully deleted!", "success")
    else:
        flash("Booking doesn't belong to the logged user!", "danger")
    

    return redirect(url_for("bookings"))
    
@app.route("/editBooking/<id>", methods=['GET', 'POST'])
def editBooking(id):
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    entity_key  = client.key("Booking", int(id))
    booking     = client.get(entity_key)
    room        = client.get(booking['Room'])
    user        = client.get(booking['User'])

    if not booking:
        return redirect(url_for("index"))
    
    #CHECK IF THE BOOKING BELONGS TO THE LOGGED USER
    if not user.key.id == session['id']:
        flash("Booking doesn't belong to the logged user!", "danger")
        return redirect(url_for("bookings"))

    title                   = "Edit Booking - Room: " + str(room.key.id) + ' - ' + room['name']
    form                    = bookingForm()
    form.room_number.data   = room.key.id
    form.id_hidden.data     = booking.key.id

    if request.method == 'GET':
        form.dt_start.data      = booking['dt_start']
        form.hr_start.data      = booking['dt_start']
        form.dt_finish.data     = booking['dt_finish']
        form.hr_finish.data     = booking['dt_finish']

    #EDIT BOOKING IN THE DATABASE
    if form.validate_on_submit():
        dt_start    = form.dt_start.data
        dt_finish   = form.dt_finish.data
        hr_start    = form.hr_start.data
        hr_finish   = form.hr_finish.data
        
        booking.update({
            'dt_start' : datetime.combine(dt_start, hr_start),
            'dt_finish' : datetime.combine(dt_finish, hr_finish),
        })

        client.put(booking)

        flash(f"Booking was successfully edited!", "success")

        return redirect(url_for('bookings'))

    return render_template('booking.html', form=form, title=title)
    
@app.route("/deleteRoom", methods=['POST'])
def deleteRoom():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    id = request.form['id']
    entity_key  = client.key("Room", int(id))
    room        = client.get(entity_key)

    if not room:
        flash("Room doesn't exist!", "danger")
        return redirect(url_for("index"))
    
    query = client.query(kind="Booking")
    query.add_filter("Room", "=", entity_key)
    bookings = list(query.fetch())

    #CHECKING IF THERE IS A BOOKING IN THE ROOM
    if bookings:
        flash(f"Room {str(room.key.id)} - {room['name']} can't be deleted. There are still bookings in the room!", "danger")
        return redirect(url_for("index"))
    
    client.delete(room.key)

    flash(f"{str(room.key.id)} - {room['name']}  was successfully deleted!", "success")

    return redirect(url_for("index"))
    