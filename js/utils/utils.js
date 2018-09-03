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
    "followersRatio": 1,
		"enableComment": false,
		"commentPercentage": 15,
		"commentText": ["Amazing post {username}!"]
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
		if (item.prefs.enableComment) {
      prefs.enableComment = item.prefs.enableComment;
    }
		if (item.prefs.commentPercentage) {
      prefs.commentPercentage = parseInt(item.prefs.commentPercentage);
    }
		if(item.prefs.commentText) {
			prefs.commentText = item.prefs.commentText.split("\n");
		}
  }

  return prefs;
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			console.log(c.substring(name.length, c.length))
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
