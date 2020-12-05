from flask import Blueprint, request, session, jsonify, abort, make_response, send_from_directory
from monitors_helpers import download_whole_page, add_script_to_html, delete_folder
from requests_html import HTMLSession
from flask_cors import cross_origin
from flask_jwt_extended import decode_token
from constants import SERVER_URL, PATH_TO_SAVE_DIFFS
import uuid
import re
from enums import FileStatus

monitors = Blueprint('monitors', __name__, url_prefix='/monitors')
from data_base import insert_monitor, find_monitor, update_monitor, find_scan, find_deleted_files, find_changed_files, deactivate_monitor, find_monitors_by_user, find_all_scans_in_room
from webpage_controller import Scheduler


workers = {}

def init_workers():
    #polacz sie z baza odpal wszystkich workerow
    print(workers)

@monitors.route("/page-to-monitor", methods=['GET'])
@cross_origin()
def save_whole_page():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message="Session expired"), 401))

    adress = request.args.get('adress')
    html = download_whole_page(adress)
    add_script_to_html(html)

    webpage_path = SERVER_URL + re.search("static.*", html).group().replace('//', '/')
    return jsonify({'location': webpage_path})  

@monitors.route("/create-monitor", methods=['POST'])
@cross_origin()
def create_monitor():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message="Session expired"), 401))

    data = request.get_json()
    if not is_data_valid(data):
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
    mailNotification = data['mailNotification']
    author = user_mail
    url = data['url']
    room_id = uuid.uuid4().hex

    insert_monitor(room_id, url, choosenElement, keyWords, intervalMinutes, start, end,
     textChange, allFilesChange, author, mailNotification)
    delete_folder(url)

    worker = Scheduler(room_id, start, end, tag, index, keyWords, intervalMinutes,
     textChange, allFilesChange, author, url, mailNotification)
    workers[room_id] = worker
    worker.run()
    
    return jsonify({'roomId': room_id})

def is_data_valid(data):
    return ('start' in data and 'end' in data and 'choosenElement' in data and 
    'intervalMinutes' in data and 'url' in data)

@monitors.route("/get-monitor", methods=['GET'])
@cross_origin()
def get_monitor():
    monitor_id = request.args.get('monitorId')
    monitor = find_monitor(monitor_id)
    if not monitor:
        abort(make_response(jsonify(message='Monitor dosen\'t exist'), 404))
    else:
        index, tag = monitor['choosenElements'].split()
        monitor['choosenElements'] = {index: index, tag: tag}

        return jsonify({'monitor': monitor})

@monitors.route("/get-users-monitors", methods=['GET'])
@cross_origin()
def get_monitors_by_user():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message='Session expired'), 401))
    
    monitors = find_monitors_by_user(user_mail)
    return jsonify(monitors)

@monitors.route("/update-monitor", methods=['PUT'])
@cross_origin()
def recreate_monitor():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message='Session expired'), 401))

    data = request.get_json()
    if not ('start' in data and 'end' in data and 'intervalMinutes' in data):
        abort(make_response(jsonify(message='Invalid form'), 400))
    
    monitor_id = data['id']
    old_worker = workers.get(monitor_id)
    if not old_worker:
        abort(make_response(jsonify(message='Monitor dosent exist'), 400))

    author, index, tag, url, scan_id = old_worker.get_recreate_properties()
    if(user_mail != author):
        abort(make_response(jsonify(message='Unauthorized'), 401))
    
    old_worker.stop()

    start = data['start']
    end = data['end']
    keyWords = data['keyWords']
    intervalMinutes = data['intervalMinutes']
    textChange = data['textChange']
    allFilesChange = data['allFilesChange']
    mailNotification = data['mailNotification']
    update_monitor(monitor_id, keyWords, intervalMinutes, textChange, allFilesChange, mailNotification, start, end)

    worker = Scheduler(monitor_id, start, end, tag, index, keyWords, intervalMinutes, textChange, allFilesChange, user_mail, url, mailNotification, scan_id)
    workers[monitor_id] = worker
    worker.run()
    
    return jsonify({'roomId': monitor_id})

@monitors.route("/delete-monitor", methods=['DELETE'])
@cross_origin()
def delete_monitor():
    user_mail = decode_token(request.headers.get('Authorization')).get('identity')
    if(not user_mail):
        abort(make_response(jsonify(message='Session expired'), 401))

    monitor_id = request.args.get('monitorId')
    if not monitor_id:
        abort(make_response(jsonify(message='Invalid form'), 400))

    old_worker = workers.get(monitor_id)
    if not old_worker:
        abort(make_response(jsonify(message='Monitor dosent exist'), 400))

    author = old_worker.get_recreate_properties()[0]
    if(user_mail != author):
        abort(make_response(jsonify(message='Unauthorized'), 401))
    
    old_worker.stop()
    workers.pop(monitor_id, None)
    deactivate_monitor(monitor_id)
    
    return jsonify({'roomId': monitor_id})

@monitors.route("/get-existing-scans", methods=['GET'])
@cross_origin()
def get_existing_scans():
    monitor_id = request.args.get('monitorId')
    monitor = find_monitor(monitor_id)
  
    if not monitor:
        abort(make_response(jsonify(message='Monitor dosen\'t exist'), 404))
    else:
        scans = find_all_scans_in_room(monitor_id)
        prepared_scans = [prepare_scan_raport(monitor, scan) for scan in scans]

    return jsonify({'scans': prepared_scans})


@monitors.route("/get-scan", methods=['GET'])
@cross_origin()
def get_scan():
    monitor_id = request.args.get('monitorId')
    scan_id = request.args.get('scanId')

    monitor = find_monitor(monitor_id)
    if not monitor:
        abort(make_response(jsonify(message='Monitor dosen\'t exist'), 404))

    scan = find_scan(monitor_id, scan_id)
    if not scan:
        abort(make_response(jsonify(message='Scan dosen\'t exist'), 404))

    result = prepare_scan_raport(monitor, scan)
    return jsonify(result)

def prepare_scan_raport(monitor, scan):
    scan_id = scan['id']
    monitor_id = monitor['id']

    result = {}
    if monitor['textChange']:
        result['raportPath'] = f'noPath'
        result['isDiffrence'] = scan['isDiffrence']
        if scan['isDiffrence']:
            raport_path_local = f'{PATH_TO_SAVE_DIFFS}\{monitor_id}-{scan_id}.html'
            raport_path = SERVER_URL + re.search("static.*", raport_path_local).group().replace('//', '/')
            result['raportPath'] = raport_path
        
        if scan and monitor['keyWords']:
            result['keyWordsOccurance'] = scan['keyWordsOccurance']

    if monitor['allFilesChange']:
        result['new_files'] = [cut_path_name(item['fileName']) for item in find_changed_files(scan_id, monitor_id, FileStatus.NEW.value)]
        result['changed_files'] = [cut_path_name(item['fileName']) for item in find_changed_files(scan_id, monitor_id, FileStatus.MODIFIED.value)]
        result['deleted_files'] = [cut_path_name(item['fileName']) for item in find_deleted_files(scan_id, monitor_id)]

    result['date'] = scan['date']
    result['id'] = scan_id
    return result

def cut_path_name(fileName):
    return re.split(".*static", fileName)[1].replace('//', '/')
