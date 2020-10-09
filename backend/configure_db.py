import yaml

def configure_db(app):
    db = yaml.load(open('db-config.yaml'), Loader=yaml.FullLoader)
    app.config['MYSQL_HOST'] = db['mysql_host']
    app.config['MYSQL_USER'] = db['mysql_user']
    app.config['MYSQL_PASSWORD'] = db['mysql_password']
    app.config['MYSQL_DB'] = db['mysql_db']