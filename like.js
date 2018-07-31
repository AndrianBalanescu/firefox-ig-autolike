var likeElementClassSelector = '.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen, .ptsdu';
var nextElement = document.querySelector('.coreSpriteRightPaginationArrow, ._1bdSS');
var followButtonClassSelector = ".oW_lN";
var usernameClassSelector = ".nJAzx";

// Statistics
var likeCount = 0;
var followCount = 0;

// Get preferences and call loadPrefs -> starts the bot
var prefs = browser.storage.local.get("prefs");
prefs.then(loadPrefs, onError);

function loadPrefs(item) {
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
  
  var ok = checkIfPageIsBotableAndNotifyUser();
  console.log("ok: " + ok);
  if (ok) {
    startBot(prefs);
  }
}

function onError(error) {
  console.log("Error: " + error);
}

function startBot(prefs) {
  setTimeout(function() {
    checkCurrentPage(prefs);
  }, 2000); // Wait 2 seconds
}

function checkCurrentPage(prefs) {
  var name = document.querySelector(usernameClassSelector).textContent;

  if (prefs.checkFollowersRatio) {
    getProfileJson(name).then(function(profileJson) {
      var followers = parseFollowers(profileJson);
      var following = parseFollowing(profileJson);
      console.log(parseUsername(profileJson) + " Fwers: " + followers + " Fwing: " + following);

      var currentFollowersRatio = following / followers;
      if (currentFollowersRatio >= prefs.followersRatio) {
        // OK, like the current photo
        scheduleActionsOnCurrentPage(prefs);
      } else {
        // Not ok, skip to next photo
        goToNextPage(prefs);
      }
    });
  } else {
    scheduleActionsOnCurrentPage(prefs);
  }
}

function goToNextPage(prefs) {
  nextElement.click();
  startBot(prefs);
}

function scheduleActionsOnCurrentPage(prefs) {
  var nextTime = generateRandomInteger(prefs.minTime, prefs.maxTime);

  console.log("Like again in " + nextTime + " ms (" + prefs.minTime + " - " + prefs.maxTime + ")");
  setTimeout(function() {
    performActionsOnCurrentPage(prefs);
  }, nextTime);
}

function performActionsOnCurrentPage(prefs) {
  like();
  if (prefs.enableFollow) {
    follow(prefs.followsPercentage);
  }
  scheduleGoToNextPhoto(prefs);
}

function like() {
  var likeElement = document.querySelector(likeElementClassSelector);
  likeElement.click();
  likeCount++;
  console.log('Liked ' + likeCount);
}

function follow(followsPercentage) {
  var random = generateRandomInteger(0, 100);
  console.log("Random: " + random + " vincolo " + ((100 - followsPercentage)));
  if (random > (100 - followsPercentage)) {
    document.querySelector(followButtonClassSelector).click();
    followCount++;
    var name = document.querySelector(usernameClassSelector).textContent;
    console.log("Followed " + name + " (" + followCount + ")");
  }
}

function scheduleGoToNextPhoto(prefs) {
  setTimeout(function() {
    goToNextPage(prefs);
  }, 1000);
}

function checkIfPageIsBotableAndNotifyUser() {
  console.log("next");
  console.log(nextElement);
  if (nextElement !== null) {
    notifyUser("Starting IG Autolike", "Page: " + document.title);
    return true;
  } else {
    notifyUser("Unable to start IG Autolike", "Page: " + document.title);
    return false;
  }
}
