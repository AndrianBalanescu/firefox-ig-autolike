var botInfo = {
  botRunning: false
};

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({
    file: "/like.js"
  })
  .then(listenForClicks)
  .catch(error => console.log(error));

// request current bot status to content script
browser.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  browser.tabs.sendMessage(
    tabs[0].id, {
      command: "requestBotStatus"
    })
		.then(loadStatus)
		.catch(error => console.log(error));
});

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("change", (e) => {
    /**
     * send a "toggle" message to the content script in the active tab.
     */
    function toggleBot(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        command: "toggle",
      });
    }

    /**
     * Get the active tab, send a "toggle" message and update the view.
     */
    if (e.target.id === "startButton") {
      console.log("status: ");
      console.info(JSON.stringify(botInfo, null, 4));
      var newStatus = {
        botRunning: !botInfo.botRunning,
        likeCount: 0,
        followCount: 0
      };
      console.log(newStatus);
      loadStatus(newStatus); // Update popup views
      browser.tabs.query({
          active: true,
          currentWindow: true
        })
        .then(toggleBot)
        .catch(error => console.error(error));
    }
  });
}

function loadStatus(info) {
  botInfo = info;
  var status = "Stopped";
  var checked = false;
  var statsVisibility = "none";
  if (info.botRunning) {
    status = "Started";
    checked = true;
    statsVisibility = "block";
  }

	const statusElem = document.querySelector("#status");
	if (statusElem != null) statusElem.innerHTML = status;

	const startButtonElem = document.querySelector("#startButton");
	if(startButtonElem != null) startButtonElem.checked = checked;

	const statsContainerElem = document.querySelector("#stats-container");
	if(statsContainerElem != null) statsContainerElem.style.display = statsVisibility;

	const likedNumberElem = document.querySelector("#liked-number");
	if(likedNumberElem != null) likedNumberElem.innerHTML = info.likeCount || 0;

	const followedNumberElemen = document.querySelector("#followed-number");
	if(followedNumberElemen != null) followedNumberElemen.innerHTML = info.followCount || 0;
}
