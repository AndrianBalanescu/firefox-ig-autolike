function saveOptions(e) {
    browser.storage.local.set({
        times: {
            minTime: document.querySelector("#minTime").value,
            maxTime: document.querySelector("#maxTime").value
        }
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        console.log("Result.times: " + result.times);
        document.querySelector("#minTime").value = result.times.minTime || "3000";
        document.querySelector("#maxTime").value = result.times.maxTime || "15000";
    }

    function onError(error) {
        console.log("Error: " + error);
    }

    var getting = browser.storage.local.get("times");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
