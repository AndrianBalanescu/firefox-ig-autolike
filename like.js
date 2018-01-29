var likeElement = document.querySelector('.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen');
var followElement = document.querySelector('._njrw0');
var nextElement = document.querySelector('.coreSpriteRightPaginationArrow');
var likeCount = 0;
var followCount = 0;

function doLike(min, max, enableFollow) {
    likeCount++;
    console.log('Liked ' + likeCount + " | " + min + "-" + max);
    var nextTime = Math.random() * (max - min) + min;
    likeElement.click();
    var random = Math.random();
    if (enableFollow && (random > 0.5)) {
        followElement.click();
        followCount++;
        console.log('Followed ' + followCount);
    }
    setTimeout(function() {
        nextElement.click();
    }, 2000);
    if (likeCount < 500) {
        setTimeout(function() {
            doLike(min, max, enableFollow);
        }, nextTime);
    } else {}
}

function onError(error) {
    console.log("Error: " + error);
}

function onGot(item) {
    console.log("onGot!!");
    console.log("pars: "+item.times)
    var minTime = 3000;
    var maxTime = 15000;
    var enableFollow = false;
    if (item && item.times && item.times.minTime) {
        minTime = item.times.minTime;
    }
    if (item && item.times && item.times.maxTime) {
        maxTime = item.times.maxTime;
    }
    if (item && item.times && item.times.enableFollow) {
        enableFollow = item.times.enableFollow;
    }
    console.log("enableFollow is " + enableFollow);
    doLike(minTime, maxTime, enableFollow);
}

var getting = browser.storage.local.get("times");
getting.then(onGot, onError);
