from flask import Blueprint, request, session, jsonify, abort, make_response, send_from_directory
from requests_html import HTMLSession
from flask_cors import cross_origin
from flask_jwt_extended import decode_token
from pywebcopy import WebPage, config
from bs4 import BeautifulSoup
import re
import constants

monitors = Blueprint('monitors', __name__, url_prefix='/monitors')
from app import mysql

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

def download_html(adress):
    session = HTMLSession()
    page = session.get('adress')
    page.html.render() # run js 
    
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