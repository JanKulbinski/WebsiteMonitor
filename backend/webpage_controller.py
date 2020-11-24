from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from bs4.element import Comment
from constants import PATH_TO_SAVE_OlD_HTMLS, PATH_TO_SAVE_DIFFS, PATH_TO_HEADLESS_WEB_BROWSER

import os
import asyncio
import schedule
import time
import threading
import re
import difflib
from datetime import datetime, timedelta


def tag_visible(element):
    if element.parent.name in ['[document]', 'noscript', 'header', 'html', 'meta', 'head', 'input', 'script', 'style']:
        return False
    if isinstance(element, Comment):
        return False
    return True

class Scheduler:
    def __init__(self, room_id, start, end, tag, index, keyWords, intervalMinutes, textChange, allFilesChange, author, url):        
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
        self.scanId = 0

    def run(self):
        self.job_thread = threading.Thread(target=self.work)
        self.job_thread.start()

    def work(self):
        #time.sleep(self.intervalSeconds)
        options = Options()
        options.headless = True
        driver = webdriver.Chrome(executable_path=PATH_TO_HEADLESS_WEB_BROWSER, chrome_options=options)
        now = datetime.timestamp(datetime.now())
        if now < self.start:
            time.sleep((self.start-now) + 1)

        while 1:
            now = datetime.timestamp(datetime.now())
            if now >= self.end:
                print(f"MONITOR {self.room_id} has ended {datetime.now()}")
                return

            if self.textChange:
                filepath = self.download_and_save_text_from_html(driver)

                if self.scanId:
                    filepath_old = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId - 1}.txt'
                    filepath = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId}.txt'
                    diffspath = f'{PATH_TO_SAVE_DIFFS}\{self.room_id}-{self.scanId}.html'

                    file_old = open(filepath_old, 'r').readlines()
                    file_new = open(filepath, 'r').readlines()

                    old_scan_name = datetime.now() - timedelta(seconds=self.intervalSeconds)
                    new_scan_name = datetime.now()

                    diff = difflib.HtmlDiff(wrapcolumn=60).make_file(file_old, file_new, old_scan_name, new_scan_name)
                    
                    with open(diffspath, 'w') as out_file:
                        out_file.write(diff)

            if self.allFilesChange:
                print('all files change')

            self.scanId += 1

            time.sleep(self.intervalSeconds)


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
