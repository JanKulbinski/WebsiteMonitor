PATH_TO_SAVE_STATIC = r'C:\Users\janku\OneDrive\WebsiteMonitor\backend'

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
        event.target.style.border = "5px solid blue";
        event.target.style.borderRadius = "5px";
        }, false);

    items[i].addEventListener("mouseout", function(event) {
        event.target.style.border = "none";
        }, false);

    items[i].onclick = function(event) {
        event.stopPropagation();
        window.parent.postMessage({tag: tag, index: newNumberOfTags},\"'''+  FRONT_DOMAIN_URL + '''\");
        return false;
    };
  }
});
'''