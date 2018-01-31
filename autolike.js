function like() {
    chrome.tabs.executeScript(null, {
        file: "like.js"
    });
}

browser.browserAction.onClicked.addListener(like);
