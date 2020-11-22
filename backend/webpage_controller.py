from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from bs4.element import Comment
from constants import PATH_TO_SAVE_OlD_HTMLS, PATH_TO_SAVE_DIFFS

import os
import asyncio
import schedule
import time
import threading
import re
import difflib
from datetime import datetime


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
        self.tag = tag
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
        driver = webdriver.Chrome(executable_path=r'C:\Program Files (x86)\Google\chromeDriver\chromedriver.exe', chrome_options=options)
        now = datetime.timestamp(datetime.now())
        if now < self.start:
            time.sleep((self.start-now) + 1)

        while 1:
            now = datetime.timestamp(datetime.now())
            if now >= self.end:
                print(f"MONITOR {self.room_id} has ended {datetime.now()}")
                return
            
            if self.textChange:
                #filepath = self.download_and_save_html(driver, self.scanId)
                print('diff')
                self.scanId = 1
                if self.scanId:
                    filepath_old = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId - 1}.txt'
                    filepath = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{self.scanId}.txt'
                    diffspath = f'{PATH_TO_SAVE_DIFFS}\{self.room_id}.txt'

                    a = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\old-htmls\f53ac6e22d094b23bcef71bd204868e9-0.txt'
                    b = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\old-htmls\f53ac6e22d094b23bcef71bd204868e9-1.txt'
                    file1 = open(a, 'r')
                    file2 = open(b, 'r')
                    #print difflib.HtmlDiff().make_file(before, after)
                    diff = difflib.ndiff(file1.readlines(), file2.readlines())
                    with open(diffspath, "w") as file:
                        for l in diff:
                            file.write(l)
                        
                self.scanId += 1

            if self.allFilesChange:
                print('all files change')

            time.sleep(self.intervalSeconds)



    def download_and_save_html(self, driver, flag):
        driver.get(self.url)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.find_all(text=True)
        visible_texts = filter(tag_visible, text)
        result = u"\n".join(t.strip() for t in visible_texts)
        result = re.sub('(\n){3,}','\n\n',result)

        filepath = f'{PATH_TO_SAVE_OlD_HTMLS}\{self.room_id}-{flag}.txt'
        print(f'{filepath}')

        with open(filepath, "wb") as file:
            file.write(result.encode())
        
        return filepath
