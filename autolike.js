/**
 * Load utils functions
 */
function inject() {
  chrome.tabs.executeScript(null, {
    file: "js/utils/utils.js"
  });
  chrome.tabs.executeScript(null, {
    file: "js/utils/fetchers.js"
  });
  chrome.tabs.executeScript(null, {
    file: "js/utils/parsers.js"
  });
}

browser.runtime.onMessage.addListener((message) => {
  console.log("message in bg: ");
  console.log(message);
  if (message.command === "notify") {
    browser.notifications.create({
      type: "basic",
      title: message.title,
      message: message.message
    });
  } else
  if (message.command === "inject") {
    inject();
  }
});
