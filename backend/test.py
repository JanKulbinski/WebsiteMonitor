import difflib

a = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\old-htmls\f53ac6e22d094b23bcef71bd204868e9-0.txt'
b = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\old-htmls\f53ac6e22d094b23bcef71bd204868e9-1.txt'
file1 = open(a, 'r').readlines()
file2 = open(b, 'r').readlines() #mozna tu ogarnac tez fragmenty do obserwacji
diff = difflib.HtmlDiff(wrapcolumn=60).make_file(file1, file2,'a','b')

with open('out_file.html', 'w') as out_file:
    out_file.write(diff)