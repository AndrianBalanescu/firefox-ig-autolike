/* eslint no-unused-vars: "off" */
function notifyUser(title, message) {
  browser.runtime.sendMessage({
    command: "notify",
    title: title,
    message: message
  });
}

function generateRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max + 1 - min));
}

function getPrefs(item){
  var prefs = {
    "minTime": 15000,
    "maxTime": 30000,
    "enableFollow": false,
    "followsPercentage": 50,
    "checkFollowersRatio": false,
    "followersRatio": 1
  };
  if (item && item.prefs) {
    if (item.prefs.minTime) {
      prefs.minTime = parseInt(item.prefs.minTime, 10);
    }
    if (item.prefs.maxTime) {
      prefs.maxTime = parseInt(item.prefs.maxTime, 10);
    }
    if (item.prefs.enableFollow) {
      prefs.enableFollow = item.prefs.enableFollow;
    }
    if (item.prefs.followsPercentage) {
      prefs.followsPercentage = parseInt(item.prefs.followsPercentage, 10);
    }
    if (item.prefs.checkFollowersRatio) {
      prefs.checkFollowersRatio = item.prefs.checkFollowersRatio;
    }
    if (item.prefs.followersRatio) {
      prefs.followersRatio = parseFloat(item.prefs.followersRatio);
    }
  }

  return prefs;
}
