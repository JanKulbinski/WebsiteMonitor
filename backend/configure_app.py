import yaml

def configure_db(app):
    db = yaml.load(open('db-config.yaml'), Loader=yaml.FullLoader)
    app.config['MYSQL_HOST'] = db['mysql_host']
    app.config['MYSQL_USER'] = db['mysql_user']
    app.config['MYSQL_PASSWORD'] = db['mysql_password']
    app.config['MYSQL_DB'] = db['mysql_db']
    app.config['MYSQL_CURSORCLASS'] = db['mysql_cursorclass']

def configure_mail(app):
    mail_man = yaml.load(open('mail_man-config.yaml'), Loader=yaml.FullLoader)

    app.config['MAIL_SERVER'] = mail_man['mail_server']
    app.config['MAIL_PORT'] = mail_man['mail_port']
    app.config['MAIL_USE_TLS'] = mail_man['mail_use_tls']
    app.config['MAIL_USERNAME'] = mail_man['mail_username']
    app.config['MAIL_DEFAULT_SENDER'] = mail_man['mail_default_sender']
    app.config['MAIL_PASSWORD'] = mail_man['mail_password']

