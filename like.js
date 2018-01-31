var likeElement = document.querySelector('.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen');
var nextElement = document.querySelector('.coreSpriteRightPaginationArrow');
var followButtonClassSelector = "._njrw0";
var usernameClassSelector = "._2g7d5";
var likeCount = 0;
var followCount = 0;

function doLike(minTime, maxTime, enableFollow) {
    scheduleGoToNextPhoto();
    scheduleNextLike(minTime, maxTime, enableFollow);
    like();
    if (enableFollow) {
        follow();
    }
}

function like() {
    likeElement.click();
    likeCount++;
    console.log('Liked ' + likeCount);
}

function follow() {
    var random = generateRandomInteger(0, 100);
    if (random > 50) {
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

function scheduleNextLike(minTime, maxTime, enableFollow) {
    var nextTime = generateRandomInteger(minTime, maxTime);
    console.log("Like again in " + nextTime + " ms (" + minTime + " - " + maxTime + ")");
    setTimeout(function () {
        doLike(minTime, maxTime, enableFollow);
    }, nextTime);
}

function onError(error) {
    console.log("Error: " + error);
}

function onGot(item) {
    console.log("onGot!!");
    console.log("pars: " + item.times);
    var minTime = 3000;
    var maxTime = 15000;
    var enableFollow = false;
    if (item && item.times && item.times.minTime) {
        minTime = parseInt(item.times.minTime);
    }
    if (item && item.times && item.times.maxTime) {
        maxTime = parseInt(item.times.maxTime);
    }
    if (item && item.times && item.times.enableFollow) {
        enableFollow = item.times.enableFollow;
    }
    console.log("enableFollow is " + enableFollow);
    doLike(minTime, maxTime, enableFollow);
}

function generateRandomInteger(min, max) {
    return min + Math.floor(Math.random() * (max + 1 - min))
}

var getting = browser.storage.local.get("times");
getting.then(onGot, onError);
