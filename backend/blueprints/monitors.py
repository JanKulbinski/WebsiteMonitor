from flask import Blueprint, request, session, jsonify, abort, make_response, send_from_directory
from requests_html import HTMLSession
from flask_cors import cross_origin
from flask_jwt_extended import decode_token
from pywebcopy import WebPage, config
import re
import constants
import uuid
from webpage_controller import Scheduler
from bs4 import BeautifulSoup

monitors = Blueprint('monitors', __name__, url_prefix='/monitors')
from app import mysql

workers = {}

def init_workers():
    #polacz sie z baza odpal wszystkich workerow
    print(workers)

# gdy folder juz istnieje to strona nie jest sciagana, bedzie trzeba ja sciagac do temp
@monitors.route("/page-to-monitor", methods=['GET'])
@cross_origin()
def save_whole_page():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message="Session expired"), 401))

    adress = request.args.get('adress')
    config.setup_config(adress, 'static')

    wp = WebPage()
    wp.get(adress)

    wp.save_complete()
    timeout = 1
    for t in wp._threads: # blocks the calling thread until the thread whose join() method is called is terminated.
        if t.is_alive():
           t.join(timeout)

    add_script_to_html(wp.file_path)
    webpage_path = constants.SERVER_URL + re.search("static.*", wp.file_path).group().replace('//', '/')
    return jsonify({'location': webpage_path})  

@monitors.route("/create-monitor", methods=['POST'])
@cross_origin()
def create_monitor():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message="Session expired"), 401))

    data = request.get_json()
    if not ('start' in data and 'end' in data and 'choosenElement' in data and 'intervalMinutes' in data and 'url' in data):
        abort(make_response(jsonify(message='Invalid form'), 400))
    
    start = data['start']
    end = data['end']
    tag = data['choosenElement']['tag']
    index = data['choosenElement']['index']
    choosenElement = f'{index} {tag}'
    keyWords = data['keyWords']
    intervalMinutes = data['intervalMinutes']
    textChange = data['textChange']
    allFilesChange = data['allFilesChange']
    author = data['mail']
    url = data['url']
    room_id = uuid.uuid4().hex

    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO monitors (id, url, choosenElements, keyWords, intervalMinutes, start, end, textChange, allFilesChange, author) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s)',(room_id, url, choosenElement, keyWords, intervalMinutes, start, end, textChange, allFilesChange, author))
    mysql.connection.commit()

    worker = Scheduler(room_id, start, end, tag, index, keyWords, intervalMinutes, textChange, allFilesChange, author, url)
    workers[room_id] = worker
    worker.run()

    return jsonify({'roomId': room_id}) 


@monitors.route("/get-monitor", methods=['GET'])
@cross_origin()
def get_monitor():
    monitor_id = request.args.get('monitorId')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM monitors WHERE id = %s', (monitor_id,))
    monitor = cursor.fetchone()
    if not monitor:
        abort(make_response(jsonify(message='Monitor dosen\'t exist'), 404))
    else:
        index, tag = monitor['choosenElements'].split()
        monitor['choosenElements'] = {index: index, tag: tag}

        return jsonify({'monitor': monitor})


@monitors.route("/get-scan", methods=['GET'])
@cross_origin()
def get_scan():
    monitor_id = request.args.get('monitorId')
    #cursor = mysql.connection.cursor()
    #cursor.execute('SELECT * FROM monitors WHERE id = %s', (monitor_id,))
    #monitor = cursor.fetchone()
    #if not monitor:
        #abort(make_response(jsonify(message='Monitor dosen\'t exist'), 404))
    #else:
        #index, tag = monitor['choosenElements'].split()
        #monitor['choosenElements'] = {index: index, tag: tag}
    print('HIT')
    return jsonify({'monitor_id': monitor_id})

#def monitor_page(room_id):
    #from app import scheduler
    #scheduler.schedule_page_controll(room_id)


    
def add_script_to_html(file_path):
    soup = BeautifulSoup(open(file_path), 'html.parser')
    script_element = soup.new_tag('script')
    script_element.attrs['type'] = 'text/javascript'
    script_element.string = (constants.IFRAME_JS_SCRIPT)
    soup.body.append(script_element)
    with open(file_path, 'w',  encoding='utf8') as file:
        file.write(str(soup))

def getNthElement():
    soup = BeautifulSoup(open(r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\static\www.lfc.pl\www.lfc.pl\index.html'), "html.parser")
    divs = soup.body.find_all("a")
    for index, value in enumerate(divs):
        if (index == (213 - 1)):
            print(value.text)

#addScriptToHtml()
#getNthElement()