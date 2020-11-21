from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from bs4.element import Comment

import asyncio
import schedule
import time
import threading
import re
def tag_visible(element):
    if element.parent.name in ['[document]', 'noscript', 'header', 'html', 'meta', 'head', 'input', 'script']:
        return False
    if isinstance(element, Comment):
        return False
    return True

class Scheduler:
    def __init__(self, room_id, start, end, tag, index, keyWords, intervalMinutes, textChange, allFilesChange, author, url):
        self.room_id = room_id
        self.start = start
        self.end = end
        self.tag = tag
        self.index = index
        self.keyWords = keyWords
        self.textChange = textChange
        self.allFilesChange = allFilesChange
        self.author = author
        self.url = url
        self.blacklist = [
    '[document]',
    'noscript',
    'header',
    'html',
    'meta',
    'head', 
    'input',
    'script',
    # there may be more elements you don't want, such as "style", etc.
]

    def run(self):
        job_thread = threading.Thread(target=self.work)
        job_thread.start()

    def work(self):
        options = Options()
        options.headless = True
        driver = webdriver.Chrome(executable_path=r'C:\Program Files (x86)\Google\chromeDriver\chromedriver.exe', chrome_options=options)
        while 1:
            print(f"I'm working...{self.room_id}")
            self.download_html(driver)
            time.sleep(30)



    def download_html(self, driver):
        driver.get(self.url)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.find_all(text=True)
        visible_texts = filter(tag_visible, text)
        result = u"\n".join(t.strip() for t in visible_texts)
        result = re.sub('(\n){3,}','\n\n',result)
        print(result)
