var likeElement = document.querySelector('.coreSpriteHeartOpen');
var nextElement = document.querySelector('.coreSpriteRightPaginationArrow');
var likeCount = 0;

function doLike(min, max) {
    likeCount++;
    console.log('Liked ' + likeCount + " | " + min + "-" + max);
    var nextTime = Math.random() * (max - min) + min;
    likeElement.click();
    setTimeout(function() {
        nextElement.click();
    }, 1000);
    if (likeCount < 500) {
        setTimeout(function() {
            doLike(min, max);
        }, nextTime);
    } else {}
}

function onError(error) {
    console.log("Error: " + error);
}

function onGot(item) {
    console.log("onGot!!");
    var minTime = 3000;
    var maxTime = 15000;
    if (item[0] && item[0].times && item[0].times.minTime) {
        minTime = item[0].times.minTime;
    }
    if (item[0] && item[0].times && item[0].times.maxTime) {
        maxTime = item[0].times.maxTime;
    }
    doLike(minTime, maxTime);
}

var getting = browser.storage.local.get("times");
getting.then(onGot, onError);
