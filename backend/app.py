from flask import Flask, request,  send_from_directory
from flask_mysqldb import MySQL
from configure_app import configure_db, configure_mail
from flask_cors import CORS
from flask_jwt_extended import (JWTManager)
from flask_mail import Mail

app = Flask(__name__, static_folder="static")

cors = CORS(app)
app.secret_key = "eEZJxcFsyR5WLnVa8LqHLpKPllJR8v10"
jwt = JWTManager(app)


# configure db
configure_db(app)
configure_mail(app)

mysql = MySQL(app)
mail = Mail(app)

# configure routes
from blueprints.authentication import auth
from blueprints.monitors import monitors, init_workers
app.register_blueprint(auth)
app.register_blueprint(monitors)

if __name__ == '__main__':
    app.run(debug=True)
    init_workers()