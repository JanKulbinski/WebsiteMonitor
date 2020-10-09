from flask import Blueprint
auth = Blueprint('authentication', __name__)

from app import mysql

@auth.route("/", methods=['POST', 'GET'])
def getUsers():
    cur = mysql.connection.cursor()
    users = cur.execute("SELECT * FROM users")
    return f'Hello {cur.fetchall()}'