
def insert_monitor(room_id, url, choosenElement, keyWords, intervalMinutes, start, end, textChange, allFilesChange, author):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO monitors (id, url, choosenElements, keyWords, intervalMinutes, start, end, textChange, allFilesChange, author) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s)',(room_id, url, choosenElement, keyWords, intervalMinutes, start, end, textChange, allFilesChange, author))
        mysql.connection.commit()

def find_monitor(monitor_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM monitors WHERE id = %s', (monitor_id,))
        monitor = cursor.fetchone()
        return monitor

def insert_scan(scanId, room_id, is_diffrence):
    is_diffrence_number = int(is_diffrence == True)
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO scans (id, monitorId, isDiffrence) VALUES (%s, %s, %s)',(scanId, room_id, is_diffrence_number))
        mysql.connection.commit()

def find_salt(mail):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT salt FROM users WHERE mail = %s', (mail,))
        return cursor.fetchone()

def check_user(mail, password_hash):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE mail = %s AND password = %s', (mail, password_hash,))
        return cursor.fetchone()

def find_user(mail):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE mail = %s', (mail,))
        return cursor.fetchone()

def insert_user(mail, name, surname, salt, key):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO users VALUES (%s, %s, %s, %s, %s)', (mail, name, surname, salt, key,))
        return cursor.fetchone()