from flask import Blueprint, request, session, jsonify, abort, make_response, send_from_directory
from requests_html import HTMLSession
from pywebcopy import WebPage, config
import re
monitors = Blueprint('monitors', __name__, url_prefix='/monitors')
from app import mysql, PATH_TO_SAVE_STATIC, SERVER_URL

# gdy folder juz istnieje to strona nie jest sciagana, bedzie trzeba ja sciagac do temp
@monitors.route("/page-to-monitor", methods=['GET'])
def save_whole_page():
    adress = request.args.get('adress')
    config.setup_config(adress, 'static')

    wp = WebPage()
    wp.get(adress)

    wp.save_complete()
    timeout = 1
    for t in wp._threads: # blocks the calling thread until the thread whose join() method is called is terminated.
        if t.is_alive():
           t.join(timeout)

    webpage_path = SERVER_URL + re.search("static.*", wp.file_path).group().replace('//', '/')
    return jsonify({'location': webpage_path})  


def download_html(adress):
    session = HTMLSession()
    page = session.get('adress')
    page.html.render() # run js 