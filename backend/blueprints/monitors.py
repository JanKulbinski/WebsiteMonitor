from flask import Blueprint, request, session, jsonify, abort, make_response, send_from_directory
from requests_html import HTMLSession
from pywebcopy import WebPage, config

monitors = Blueprint('monitors', __name__, url_prefix='/monitors')
from app import mysql, PATH_TO_SAVE_STATIC


@monitors.route("/page-to-monitor", methods=['GET'])
def save_whole_page():
    adress = request.args.get('adress')
    config.setup_config(adress, 'static')

    wp = WebPage()
    wp.get(adress)

    # start the saving process
    wp.save_complete()
    timeout = 1
    # join the sub threads
    for t in wp._threads:
        if t.is_alive():
           t.join(timeout)

    # location of the html file written 
    return jsonify({'location': wp.file_path})


def download_html(adress):
    session = HTMLSession()
    page = session.get('adress')
    page.html.render() # run js 