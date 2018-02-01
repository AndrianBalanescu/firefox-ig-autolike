function saveOptions(e) {
    browser.storage.local.set({
        prefs: {
            minTime: document.querySelector("#minTime").value,
            maxTime: document.querySelector("#maxTime").value,
            enableFollow: document.querySelector("#enableFollow").checked,
            followsPercentage: document.querySelector("#followsPercentage").value
        }
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#minTime").value = (result.prefs && result.prefs.minTime) || "3000";
        document.querySelector("#maxTime").value = (result.prefs && result.prefs.maxTime) || "15000";
        document.querySelector("#enableFollow").checked = (result.prefs && result.prefs.enableFollow) || false;
        document.querySelector("#followsPercentage").value = (result.prefs && result.prefs.followsPercentage) || 50;
    }

    function onError(error) {
        setCurrentChoice({"prefs": {}})
    }

    var getting = browser.storage.local.get("prefs");
    getting.then(setCurrentChoice, onError);
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
    restoreOptions();
else
    document.addEventListener("DOMContentLoaded", restoreOptions);

document.querySelector("form").addEventListener("submit", saveOptions);
