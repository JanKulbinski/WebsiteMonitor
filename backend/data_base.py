from datetime import datetime

def insert_monitor(room_id, url, choosen_element, key_words, interval_minutes, start, end,
 text_change, all_files_change, author, mail_notification):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO monitors \
            (id, url, choosenElements, keyWords, intervalMinutes, start, end, \
                textChange, allFilesChange, author, mailNotification) \
            VALUES \
            (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
             (room_id, url, choosen_element, key_words, interval_minutes, start,\
                  end, text_change, all_files_change, author, mail_notification))
        mysql.connection.commit()

def find_monitor(monitor_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM monitors WHERE id = %s and active = 1', (monitor_id,))
        monitor = cursor.fetchone()
        return monitor

def find_monitors_by_user(mail):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT id, url, start, end, active FROM monitors WHERE author = %s ORDER BY start DESC', (mail,))
        return cursor.fetchall()

def update_monitor(room_id, key_words, interval_minutes, text_change, all_files_change, mail_notification, start, end):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE monitors SET \
            keyWords = %s, intervalMinutes = %s, textChange = %s,\
                 start = %s, end = %s, allFilesChange = %s, mailNotification = %s WHERE id = %s',
        (key_words, interval_minutes, text_change, start, end, all_files_change, mail_notification, room_id))
        mysql.connection.commit()

def deactivate_monitor(monitor_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE monitors SET active = 0 WHERE id = %s', (monitor_id,))
        mysql.connection.commit()

def insert_scan(scan_id, room_id, is_diffrence, key_words_result=""):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    is_diffrence_number = int(is_diffrence == True)
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO scans (id, monitorId, isDiffrence, keyWordsOccurance, date) \
            VALUES (%s, %s, %s, %s, %s)',(scan_id, room_id, is_diffrence_number, key_words_result, now))
        mysql.connection.commit()

def find_scan(monitor_id, scan_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM scans WHERE monitorId = %s AND id = %s', (monitor_id, scan_id))
        monitor = cursor.fetchone()
        return monitor

def find_all_scans_in_room(monitor_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM scans WHERE monitorId = %s AND id > 0', (monitor_id,))
        return cursor.fetchall()

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
        mysql.connection.commit()

def find_changed_files(scan_id, room_id, status):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT fileName FROM files WHERE scanId = %s AND monitorId = %s AND fileStatus = %s',
         (scan_id, room_id, status))
        return cursor.fetchall()

def find_deleted_files(scan_id, room_id):
    scan_id = int(scan_id) - 1
    if scan_id < 0:
        return []
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('''
        SELECT f1.fileName FROM
            (SELECT scanId, monitorId, fileName 
	         FROM files
	         WHERE scanId = %s and monitorId = %s 
            ) as f1
        LEFT JOIN files AS f2 on
         ( f1.scanId + 1 = f2.scanId and f1.monitorId = f2.monitorId and f1.fileName = f2.fileName)
        WHERE f2.scanId is NULL
        ''', (scan_id, room_id))
        return cursor.fetchall()

def find_file(file_name, scan_id, room_id):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM files \
            WHERE fileName = %s AND scanId = %s AND monitorId = %s',
         (file_name, scan_id, room_id))
        return cursor.fetchone()

def insert_file(scan_id, room_id, file_hash, file_name, status):
    from app import app, mysql
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO files (scanId, monitorId, fileHash, fileName, fileStatus) \
            VALUES (%s, %s, %s, %s, %s)',
         (scan_id, room_id, file_hash, file_name, status))
        mysql.connection.commit()
