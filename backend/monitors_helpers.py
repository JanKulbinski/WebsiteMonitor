from pywebcopy import WebPage, config
from bs4 import BeautifulSoup
import constants
import shutil
import re


def get_project_path(url):
    url = url.replace('https://', '')
    url = url.replace('http://', '')
    url = url.replace('/', '//')
    prefix = re.search("[^/]*/", url)
    if prefix:
        url = prefix.group()

    if url[-1] == '/':
        url = url[:-1]
    prefix = r'\static'
    url = f'{constants.PATH_TO_SAVE_STATIC}{prefix}\{url}'
    return url

def delete_folder(url):
    url = get_project_path(url)
    shutil.rmtree(url)
    print(f'{url} removed.')


def add_script_to_html(file_path):
    soup = BeautifulSoup(open(file_path), 'html.parser')
    script_element = soup.new_tag('script')
    script_element.attrs['type'] = 'text/javascript'
    script_element.string = (constants.IFRAME_JS_SCRIPT)
    soup.body.append(script_element)
    with open(file_path, 'w',  encoding='utf8') as file:
        file.write(str(soup))

def download_whole_page(adress):
    config.setup_config(adress, 'static')

    wp = WebPage()
    wp.get(adress)

    wp.save_complete()
    timeout = 1
    for t in wp._threads: # blocks the calling thread until the thread whose join() method is called is terminated.
        if t.is_alive():
           t.join(timeout)

    return wp.file_path