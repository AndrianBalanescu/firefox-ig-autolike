var likeElement = document.querySelector('.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen');
var nextElement = document.querySelector('.coreSpriteRightPaginationArrow');
var followButtonClassSelector = "._njrw0";
var usernameClassSelector = "._2g7d5";
var likeCount = 0;
var followCount = 0;

function doLike(prefs) {
    scheduleGoToNextPhoto();
    scheduleNextLike(prefs);
    like();
    if (prefs.enableFollow) {
        follow(prefs.followsPercentage);
    }
}

function like() {
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

function scheduleGoToNextPhoto() {
    setTimeout(function () {
        nextElement.click();
    }, 2000);
}

function scheduleNextLike(prefs) {
    var nextTime = generateRandomInteger(prefs.minTime, prefs.maxTime);
    console.log("Like again in " + nextTime + " ms (" + prefs.minTime + " - " + prefs.maxTime + ")");
    setTimeout(function () {
        doLike(prefs);
    }, nextTime);
}

function onError(error) {
    console.log("Error: " + error);
}

function onGot(item) {
    var prefs = {
        "minTime": 3000,
        "maxTime": 15000,
        "enableFollow": false,
        "followsPercentage": 50
    };
    if (item && item.prefs) {
        if (item.prefs.minTime) {
            prefs.minTime = parseInt(item.prefs.minTime);
        }
        if (item.prefs.maxTime) {
            prefs.maxTime = parseInt(item.prefs.maxTime);
        }
        if (item.prefs.enableFollow) {
            prefs.enableFollow = item.prefs.enableFollow;
        }
        if (item.prefs.followsPercentage) {
            prefs.followsPercentage = parseInt(item.prefs.followsPercentage);
        }
    }
    doLike(prefs);
}

function generateRandomInteger(min, max) {
    return min + Math.floor(Math.random() * (max + 1 - min))
}

var getting = browser.storage.local.get("prefs");
getting.then(onGot, onError);
