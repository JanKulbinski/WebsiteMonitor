from flask import Flask, request,  send_from_directory
from flask_mysqldb import MySQL
from configure_db import configure_db

app = Flask(__name__, static_folder="static")
app.secret_key = "eEZJxcFsyR5WLnVa8LqHLpKPllJR8v10"
PATH_TO_SAVE_STATIC = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend'
SERVER_URL = 'http://localhost:5000/'

# configure db
configure_db(app)
mysql = MySQL(app)

# configure routes
from blueprints.authentication import auth
from blueprints.monitors import monitors
app.register_blueprint(auth)
app.register_blueprint(monitors)

if __name__ == '__main__':
    app.run(debug=True)