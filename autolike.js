function like() {
  chrome.tabs.executeScript(null, {
    file: "js/utils/fetchers.js"
  });
  chrome.tabs.executeScript(null, {
    file: "js/utils/parsers.js"
  });
  chrome.tabs.executeScript(null, {
    file: "like.js"
  });
}

browser.browserAction.onClicked.addListener(like);
