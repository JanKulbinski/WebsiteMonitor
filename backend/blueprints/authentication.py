from flask import Blueprint, request, session, jsonify, abort, make_response
from flask_jwt_extended import (
    jwt_required, create_access_token,
    get_jwt_identity
)
from flask_cors import cross_origin
from requests_html import HTMLSession
from base64 import b64decode
from datetime import timedelta
import re
import hashlib
import os
import random 


auth = Blueprint('authentication', __name__)
from data_base import find_user, find_salt, check_user, insert_user

@auth.route("/login", methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    if not ('mail' in data and 'password' in data):
        abort(make_response(jsonify(message='Invalid form'), 400))

    mail = data['mail']
    password = data['password']

    userBymail = find_salt(mail)
    if userBymail:
        salt = userBymail['salt']
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000, dklen=128)
        user = check_user(mail, password_hash)

        if user:
            expires = timedelta(hours=24)
            access_token = create_access_token(identity=mail, expires_delta=expires)
            return jsonify({'message': 'Successfully logged in', 'token': access_token})

    abort(make_response(jsonify(message="Incorrect credentials"), 401))

@auth.route("/logout", methods=['POST'])
@cross_origin()
def logout():
    return jsonify({'message': 'Successfully logged out'})

@auth.route('/register', methods=['POST'])
@cross_origin()
def register():
    data = request.get_json()
    if not ('name' in data and 'surname' in data and 'password' in data and 'mail' in data):
        abort(make_response(jsonify(message='Invalid form'), 400))
    
    name = data['name']
    surname = data['surname']
    password = data['password']
    mail = data['mail']

    user = find_user(mail)    
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
        
        insert_user(mail, name, surname, salt, key)
        expires = timedelta(hours=24)
        access_token = create_access_token(identity=mail, expires_delta=expires)
        
        return jsonify({'message': 'Successfully registered and logged in', 'token': access_token}), 201
