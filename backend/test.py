import os
import hashlib
import glob 

a = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\static\news.ycombinator.com'
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def generate_hash(file_name, subdir):
    filepath = subdir + os.sep + file_name                   
    with open(filepath, "rb") as f:
        file_hash = hashlib.blake2b(digest_size=32)
        while chunk := f.read(8192):
            file_hash.update(chunk)
        file_hash.digest()
    print(f'hash for {filepath}' )
    return file_hash.digest()

everything = glob.glob(f'{a}/**/*', recursive=True) 
print(everything)

'''
for subdir, _, files in os.walk(a):
    print(files)
    
    for file_name in files:
        print(bcolors.WARNING + file_name +bcolors.ENDC)
    #    new_hash = generate_hash(file_name, subdir)
    #    print(new_hash)
'''