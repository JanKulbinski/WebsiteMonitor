PATH_TO_SAVE_STATIC = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend'
PATH_TO_SAVE_DIFFS = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\diffs'
PATH_TO_SAVE_OlD_HTMLS = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend\old-htmls'

SERVER_URL = 'http://localhost:5000/'
FRONT_DOMAIN_URL = 'http://localhost:3000/'

IFRAME_JS_SCRIPT = '''
        document.addEventListener('DOMContentLoaded', function() {
            const items = document.getElementsByTagName('*');
            const countTagsByType = new Map();

            for (var i = 0; i < items.length; i++) {
                const tag = items[i].tagName;
                const numberOfTags = countTagsByType.get(tag);
                const newNumberOfTags = numberOfTags ? (numberOfTags + 1) : 1;
                countTagsByType.set(tag, newNumberOfTags)

                items[i].addEventListener("mouseover", function(event) {
                    if (event.target.style.border != '5px solid rgb(252, 219, 156)') {
                        event.target.style.border = "5px solid black";
                        event.target.style.borderRadius = "5px";
                    }
                }, false);

                items[i].addEventListener("dblclick", function(event) {
                    event.stopPropagation();
                    if (event.target.style.border == '5px solid rgb(252, 219, 156)') {
                        event.target.style.borderColor = 'transparent';
                        window.parent.postMessage({
                            tag: '',
                            index: 0
                        }, "http://localhost:3000/");
                        return false;
                    }

                    const items2 = document.getElementsByTagName('*');
                    for (var j = 0; j < items2.length; j++) {
                        if (items2[j].style.border == '5px solid rgb(252, 219, 156)') {
                            items2[j].style.border = "none";
                            break;
                        }
                    }
                    event.target.style.border = "5px solid rgb(252, 219, 156)";
                    window.parent.postMessage({
                        tag: tag,
                        index: newNumberOfTags
                    }, "http://localhost:3000/");


                    return false;
                });

                items[i].addEventListener("mouseout", function(event) {
                    if (event.target.style.border == '5px solid black') {
                        event.target.style.border = "none";
                    }
                }, false);

                items[i].onclick = function(event) {
                    event.stopPropagation();
                    return false;
                }
            }
        });
    </script>
'''