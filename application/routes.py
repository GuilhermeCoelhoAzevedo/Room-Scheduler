from application import app, client
from flask import Flask, render_template, request, session, url_for, redirect, flash, json, jsonify
from application.forms import roomForm

from google.cloud import datastore
import google.oauth2.id_token
from google.auth.transport import requests

firebase_request_adapter = requests.Request()

@app.route("/index")
def index():
    #CHECK IF USER IS LOGGED IN
    if not session.get('email'):
        return redirect(url_for("login"))

    query   = client.query(kind='Room')
    room    = query.fetch()

    return render_template('index.html', index=True, roomData=room)

@app.route("/")
@app.route("/login", methods=['GET', 'POST'])
def login():
    id_token = request.cookies.get("token")
    error_message = None
    claims = None

    if id_token:
        try:
            claims = google.oauth2.id_token.verify_firebase_token(id_token, firebase_request_adapter)
            
            #CONTROL USER SESSION
            session['email']    = claims['email']

            query = client.query(kind='User')
            query.add_filter("email", "=", session['email'])
            userData = list(query.fetch())

            if not userData:
                user = datastore.Entity(key = client.key('User'))
        
                user.update({
                    'email' : session['email']
                })

                client.put(user)
                session['id'] = user.key.id
            else:
                for user in userData:
                    session['id'] = user.key.id

            flash(f"{claims['email']}, you are successfully logged in!", "success")

            return redirect(url_for("index"))

        except ValueError as exc:
            error_message = str(exc)
            flash("Sorry, something went wrong!", "danger")

    return render_template('login.html', login=True)

@app.route("/logout")
def logout():
    session.pop('id', None)
    session.pop('email', None)

    return redirect(url_for('login'))

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