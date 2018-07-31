function like() {
  chrome.tabs.executeScript(null, {
    file: "js/utils/utils.js"
  });
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

browser.runtime.onMessage.addListener((message) => {
  browser.notifications.create({
    type: "basic",
    title: message.title,
    message: message.message
  });
});
