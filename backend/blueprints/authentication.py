from flask import Blueprint, request, session, jsonify, abort, make_response
from requests_html import HTMLSession
from base64 import b64decode
import re
import hashlib
import os
import random 

auth = Blueprint('authentication', __name__)
from app import mysql


@auth.route("/health-check", methods=['GET'])
def healthCheck():
    if session.get('logged_in') == True:
        return jsonify(session.get('mail'))   
    abort(make_response(jsonify(message='Not logged in'), 401))

@auth.route("/all-users", methods=['GET'])
def get_users():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    return f'{cur.fetchall()}'

@auth.route("/login", methods=['POST'])
def login():
    if not ('mail' in request.form and 'password' in request.form):
        abort(make_response(jsonify(message='Invalid form'), 400))

    mail = request.form['mail']
    password = request.form['password']

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT salt FROM users WHERE mail = %s', (mail,))
    salt = cursor.fetchone()['salt']
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000, dklen=128)

    cursor.execute('SELECT * FROM users WHERE mail = %s AND password = %s', (mail, password_hash,))
    user = cursor.fetchone()

    if user:
        session['logged_in'] = True
        session['mail'] = user['mail']
        session['name'] = user['name']
        session['surname'] = user['surname']
        return jsonify({'message': 'Successfully logged in'})
    else:
        abort(make_response(jsonify(message="Incorrect credentials"), 401))

@auth.route("/logout", methods=['POST'])
def logout():
    session.pop('logged_in', None)
    session.pop('mail', None)
    session.pop('name', None)
    session.pop('surname', None)
    return jsonify({'message': 'Successfully logged out'})

@auth.route('/register', methods=['POST'])
def register():
    if not ('name' in request.form and 'surname' in request.form and 'password' in request.form and 'mail' in request.form):
        abort(make_response(jsonify(message='Invalid form'), 400))
    
    name = request.form['name']
    surname = request.form['surname']
    password = request.form['password']
    mail = request.form['mail']

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users WHERE mail = %s', (mail,))
    user = cursor.fetchone()
    
    if user:
        abort(make_response(jsonify(message='Account already exists'), 409))
    elif not re.match(r'[^@]+@[^@]+\.[^@]+', mail):
        abort(make_response(jsonify(message='Invalid email address'), 400))
    elif not re.match(r'[A-Za-z0-9]+', name):
        abort(make_response(jsonify(message='Name must contain only characters and numbers'), 400))
    elif not re.match(r'[A-Za-z0-9]+', surname):
        abort(make_response(jsonify(message='Surname must contain only characters and numbers'), 400))
    else:
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac(
            'sha256', # The hash digest algorithm for HMAC
            password.encode('utf-8'), # Convert the password to bytes
            salt,
            100000, # It is recommended to use at least 100,000 iterations of SHA-256
            dklen=128 # Get a 128 byte key
        ) 
        
        cursor.execute('INSERT INTO users VALUES (%s, %s, %s, %s, %s)', (mail, name, surname, salt, key,))
        mysql.connection.commit()
        session['logged_in'] = True
        session['mail'] = mail
        session['name'] = name
        session['surname'] = surname

        return jsonify({'message': 'Successfully registered and logged in'}), 201
