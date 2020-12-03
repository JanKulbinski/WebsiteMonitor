from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from bs4.element import Comment
from constants import PATH_TO_SAVE_OlD_HTMLS, PATH_TO_SAVE_DIFFS, PATH_TO_HEADLESS_WEB_BROWSER
from data_base import insert_scan, find_file, insert_file, find_scan, deactivate_monitor, find_changed_files, find_deleted_files
from datetime import datetime, timedelta
from monitors_helpers import download_whole_page, get_project_path, delete_folder
from enums import FileStatus
import os
import asyncio
import schedule
import time
import threading
import re
import difflib
import filecmp
import hashlib
import constants
import glob 

def tag_visible(element):
    if element.parent.name in ['[document]', 'noscript', 'header', 'html', 'meta', 'head', 'input', 'script', 'style']:
        return False
    if isinstance(element, Comment):
        return False
    return True

class Scheduler:
    def __init__(self, room_id, start, end, tag, index, keyWords, intervalMinutes, textChange, allFilesChange, author, url, mailNotification, scanId=0):        
        start = datetime.strptime(start, '%Y-%m-%d %H:%M:%S')
        self.start = datetime.timestamp(start)

        end = datetime.strptime(end, '%Y-%m-%d %H:%M:%S')
        self.end = datetime.timestamp(end)

        self.room_id = room_id
        self.tag = tag.lower()
        self.index = index
        self.keyWords = keyWords
        self.intervalSeconds = int(intervalMinutes) * 60
        self.textChange = textChange
        self.allFilesChange = allFilesChange
        self.author = author
        self.url = url
        self.mailNotification = mailNotification
        self.scanId = scanId
        self.active = True

    def get_recreate_properties(self):
        return self.author, self.index, self.tag, self.url, self.scanId

    def run(self):
        self.job_thread = threading.Thread(target=self.work)
        self.job_thread.start()

    def stop(self):
        self.active = False

    def work(self):
        options = Options()
        options.headless = True
        driver = webdriver.Chrome(executable_path=PATH_TO_HEADLESS_WEB_BROWSER, chrome_options=options)
        now = datetime.timestamp(datetime.now())
        if now < self.start:
            time.sleep((self.start-now) + 1)
    
        while 1:
            now = datetime.timestamp(datetime.now())
            if now >= self.end or (not self.textChange and not self.allFilesChange) or not self.active:
                deactivate_monitor(self.room_id)
                print(f"MONITOR {self.room_id} has ended {datetime.now()}")
                return

            mail_content = ''
            if self.textChange:
                self.download_and_save_text_from_html(driver)
                if self.scanId:
                    is_diffrence, key_words_result, mail_content = self.compare_text_and_generate_html()
                    insert_scan(self.scanId, self.room_id, is_diffrence, key_words_result)

            if self.allFilesChange:
                self.compare_all_files()
                mail_content = generate_all_files_mail(self.scanId, self.room_id) + mail_content

            if mail_content and self.mailNotification:
                self.send_mail(mail_content)

            self.scanId += 1
            time.sleep(self.intervalSeconds)

    def compare_text_and_generate_html(self):
        filepath_old = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId - 1}.txt'
        filepath = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId}.txt'
        diffspath = f'{PATH_TO_SAVE_DIFFS}\{self.room_id}-{self.scanId}.html'

        file_old = open(filepath_old, encoding="utf8").readlines()
        file_new = open(filepath,encoding="utf8").readlines()

        # key words
        key_words = self.keyWords.split(';')
        words_occurences = {}
        line_delimiter = '#$@'
        for index, line in enumerate(file_new):
            for word in key_words:
                if word in line:
                    if word in words_occurences:
                        words_occurences[word] += line + ' ' + str(index) + line_delimiter
                    else: 
                        words_occurences[word] = line + ' ' + str(index) + line_delimiter
        
        # html
        old_scan_name = datetime.now() - timedelta(seconds=self.intervalSeconds)
        new_scan_name = datetime.now()

        diff = difflib.HtmlDiff(wrapcolumn=50).make_file(file_old, file_new, old_scan_name, new_scan_name)

        with open(diffspath, 'w', encoding="utf-8") as out_file:
            out_file.write(diff)

        is_diffrence = not filecmp.cmp(filepath_old, filepath)
        word_delimiter = '!%^'
        key_words_result = ''

        if is_diffrence:
            diff = '<b style="border-bottom: solid 1px rgba(0, 0, 0, .125);">Text changes</b>' + diff
        else:
            diff = ''

        key_words_to_mail = ''
        if len(words_occurences) > 0:
            key_words_to_mail = '<b color="black" style="border-bottom: solid 1px rgba(0, 0, 0, .125);">Key words occurences</b><br>'

        for word, line in words_occurences.items():
            key_words_result += word + line_delimiter + line + word_delimiter 
            occurences = line.split(line_delimiter)
            key_words_to_mail += f'<b style="color:rgb(252, 212, 137);">{word}</b><br>'

            for occur in occurences:
                occur = occur.split(' ')
                line = occur[:-1]
                number_of_line = occur[-1]
                key_words_to_mail += f'\
                <b style="color:rgb(95, 95, 86);">{number_of_line}</b> \
                <span style="color:rgb(95, 95, 86);">{" ".join(line)}</span>'

        mail_content =  key_words_to_mail + diff
        return is_diffrence, key_words_result, mail_content

    def download_and_save_text_from_html(self, driver):
        flag = self.scanId
        driver.get(self.url)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        result = ""
        if self.tag != 'default':
            result = self.get_nth_element_on_page(soup)
        else:
            text = soup.find_all(text=True)
            text = filter(tag_visible, text)
            result = u"\n".join(t.strip() for t in text)

        result = re.sub('(\n){3,}', '\n\n', result)
        filepath = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{flag}.txt'

        with open(filepath, "wb") as file:
            file.write(result.encode())
        
        return filepath

    def get_nth_element_on_page(self, soup):
        all_tags = soup.body.find_all(self.tag)
        for i, element in enumerate(all_tags):
            if (i == (self.index - 1)):
                return element.text

    def compare_all_files(self):
        download_whole_page(self.url)
        project_path = get_project_path(self.url)

        if not self.textChange or not find_scan(self.room_id, self.scanId):
            insert_scan(self.scanId, self.room_id, False)

        files = glob.glob(f'{project_path}/**/*', recursive=True) 
        for file_name in files:
            if os.path.isdir(file_name):
                continue
            new_hash = self.generate_hash(file_name)
            
            if self.scanId:
                old_file = find_file(file_name, self.scanId - 1, self.room_id)                 
                status = FileStatus.OLD.value
                if not old_file:
                    status = FileStatus.NEW.value
                elif old_file['fileHash'] != new_hash:
                    status = FileStatus.MODIFIED.value
                insert_file(self.scanId, self.room_id, new_hash, file_name, status)
            else:
                insert_file(self.scanId, self.room_id, new_hash, file_name, FileStatus.NEW.value)
        
        delete_folder(self.url)

    def generate_hash(self, file_name):                   
        with open(file_name, "rb") as f:
            file_hash = hashlib.blake2b(digest_size=32)
            while chunk := f.read(8192):
                file_hash.update(chunk)
        return file_hash.digest()


    def send_mail(self, body):
        from app import app, mail
        from flask_mail import Message

        with app.app_context():
            adress_mail = self.mailNotification
            message = Message(f"Change detected on WebsiteMonitor for {adress_mail}.", recipients=[adress_mail])
            body = f'<h1 style="color:black">Monitor Raport for {self.url}</h1>' + body
            message.html = body
            mail.send(message)
            print('MAIL SEND!')


def generate_all_files_mail(scan_id, monitor_id):
    new_files = [f'<p  style="color:rgb(49, 211, 49); text-decoration:none"> + {cut_path_name(item["fileName"])}</p>' for item in find_changed_files(scan_id, monitor_id, FileStatus.NEW.value)]
    changed_files = [f'<p  style="color:rgb(95, 95, 86); text-decoration:none"> ~ {cut_path_name(item["fileName"])}</p>' for item in find_changed_files(scan_id, monitor_id, FileStatus.MODIFIED.value)]
    deleted_files = [f'<p  style="rgb(197, 37, 37); text-decoration:none"> - {cut_path_name(item["fileName"])}</p>' for item in find_deleted_files(scan_id, monitor_id)]

    mail_content = '<b style="color:black; border-bottom: solid 1px rgba(0, 0, 0, .125);">Files changes</b>'
    if new_files or changed_files or deleted_files:
        mail_content += ' '.join(new_files) + ' '.join(changed_files) + ' '.join(deleted_files)
    return mail_content

def cut_path_name(fileName):
    return re.split(".*static", fileName)[1].replace('//', '/')