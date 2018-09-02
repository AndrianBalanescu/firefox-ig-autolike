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
  } else if (message.command === "inject") {
    inject();
  } else if (message.command === "comment") {
    console.log("Comment message received");
    /*const headers = {
      "Content-type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": message.csrftoken,
      "X-Instagram-AJAX": "1",
      "Host": 'www.instagram.com',
      "Origin": 'https://www.instagram.com',
      "Referer": 'https://www.instagram.com/'
    };
    console.log(headers);
    fetch("https://www.instagram.com/web/comments/" + message.mediaId + "/add/", {
        headers: headers,
        body: "comment_text=" + message.commentText + "&replied_to_comment_id=",
        method: "POST"
      }).then(res => console.log(res))
      .catch(error => console.log(error))
			 /*
    var xhttp2 = new XMLHttpRequest();
    xhttp2.open("POST", "https://www.instagram.com/web/comments/" + message.mediaId + "/add/", true);
    xhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhttp2.setRequestHeader("X-CSRFToken", message.csrftoken);
    xhttp2.setRequestHeader("X-Instagram-AJAX", "1");
    console.log(xhttp2);
    xhttp2.onreadystatechange = function() {
      console.log(xhttp2)
    };
    xhttp2.send("comment_text=" + message.commentText + "&replied_to_comment_id=");
  }*/
}});
