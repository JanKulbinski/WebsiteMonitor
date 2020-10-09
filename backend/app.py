from flask import Flask, request
from flask_mysqldb import MySQL
from configure_db import configure_db

app = Flask(__name__)

# configure db
configure_db(app)
mysql = MySQL(app)

# configure routes
from blueprints.authentication import auth
app.register_blueprint(auth)

if __name__ == '__main__':
    app.run(debug=True)

