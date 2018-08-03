(function() {

  const likeElementClassSelector = '.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen, .ptsdu';
  const nextElementClassSelector = '.coreSpriteRightPaginationArrow, ._1bdSS';
  const followButtonClassSelector = ".oW_lN";
  const usernameClassSelector = ".nJAzx";

  // Statistics
  var likeCount = 0;
  var followCount = 0;

  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.botLoadingHasRun) return;
  window.botLoadingHasRun = true;

  /**
   * Communication between popup and content script
   */
  browser.runtime.onMessage.addListener(function(message, sender, response) {
    // The popup script sends a "toggle" request to start/stop the bot.
    if (message.command === "toggle") {
      window.botRunning = !window.botRunning; // Setting botRunning = false stops the bot
      if (window.botRunning) load(); // Load and start the bot
    } else if (message.command === "requestBotStatus") {
      var botStatus = {
        botRunning: window.botRunning,
        likeCount: likeCount,
        followCount: likeCount
      };
      response(botStatus);
    }
  });

	// Send message to runtime script so it can load utils function
  browser.runtime.sendMessage({
    command: "inject"
  });

  function load() {
    // Get preferences and call loadPrefs -> starts the bot
    var prefs = browser.storage.local.get("prefs");
    prefs.then(loadPrefs).catch(err => console.log(err));

    function loadPrefs(item) {
      // Uses utils.getPrefs to merge user preferences with default preferences
      const prefs = getPrefs(item);

      // If the bot can be started on the current page start it and notify the user otherwise
      if (checkIfPageIsBotableAndNotifyUser()) startBot(prefs);
      else window.botRunning = false;
    }

    /**
     * startBot() starts a single bot "iteration"
     */
    function startBot(prefs) {
      // First check if botRunning = true. If it's false return.
      if (window.botRunning) {
        setTimeout(function() {
          checkCurrentPage(prefs);
        }, 2000); // Wait 2 seconds and check if should perform operations on current page
      }
    }

    /**
     * Check if should perform operations in current page based on user preferences
     */
    function checkCurrentPage(prefs) {
      if (!window.botRunning) return; // First check if botRunning = true. If it's false return.
      var username = document.querySelector(usernameClassSelector).textContent;

      if (prefs.checkFollowersRatio) { // If should check following/followers ratio
        getProfileJson(username).then(function(profileJson) { // retrive the json of the user

          var followers = parseFollowers(profileJson),
            following = parseFollowing(profileJson);
          var currentFollowersRatio = following / followers;

          if (currentFollowersRatio >= prefs.followersRatio) {
            // OK, like the current photo
            scheduleActionsOnCurrentPage(prefs);
          } else {
            // Not ok, skip to next photo
            goToNextPage(prefs);
          }
        });
      } else { // No need to check followers ratio. Just schedule operations
        scheduleActionsOnCurrentPage(prefs);
      }
    }

		/**
		 * Check if the bot can be run on the current page and notify the user.
		 */
    function checkIfPageIsBotableAndNotifyUser() {
      var nextElement = document.querySelector(nextElementClassSelector);

      if (nextElement !== null) { // If the page contains the "next" button -> start the bot
        notifyUser("Starting IG Autolike", "Page: " + document.title);
        return true;
      } else {
        notifyUser("Unable to start IG Autolike", "Page: " + document.title);
        window.botRunning = false;
        return false;
      }
    }

    function goToNextPage(prefs) {
      if (!window.botRunning) return; // First check if botRunning = true. If it's false return.

      var nextElement = document.querySelector(nextElementClassSelector); // Try to obtain the "next" button

      if (checkElementOrStop(nextElement)) { // Check if "next" button is not null
        // If the button is available, try to fetch the next page and check the status code
        fetch(nextElement.href, {
            method: "HEAD"
          })
          .then(function(response) {
            if (response.status == 200) {
              // Ok, go to next page and start a new bot iteration
              nextElement.click();
              startBot(prefs);
            } else {
              // Error loading next page. Click next and stop the bot.
              nextElement.click();
              stopBot();
            }
          })
      }
    }

    /**
     * Generate a random integer representing the milliseconds to wait before clicking on like
     * based on user preferences and schedule the performActionsOnCurrentPage function call
     */
    function scheduleActionsOnCurrentPage(prefs) {
      var nextTime = generateRandomInteger(prefs.minTime, prefs.maxTime);

      console.log("Like again in " + nextTime + " ms (" + prefs.minTime + " - " + prefs.maxTime + ")");

      setTimeout(function() {
        performActionsOnCurrentPage(prefs);
      }, nextTime);
    }

    /**
     * First check if the bot is still running.
     * If yes -> like the current page
     * If auto follow is enabled -> follow the current user
     * Then schedule "go to next photo"
     */
    function performActionsOnCurrentPage(prefs) {
      if (!window.botRunning) return;
      like();
      if (prefs.enableFollow) {
        follow(prefs.followsPercentage);
      }
      scheduleGoToNextPhoto(prefs);
    }

    /**
     * If the like button is available like the current photo and update statistics.
     * If it is not available stop the bot and notify the user.
     */
    function like() {
      var likeElement = document.querySelector(likeElementClassSelector);
      if (!checkElementOrStop(likeElement)) return;

      likeElement.click();
      likeCount++;
      console.log('Liked ' + likeCount);
    }

    /**
     * Generate a random integer to decide whether to follow or not the current user based on user preferences.
     * Follows the current user and update the statistics.
     */
    function follow(followsPercentage) {
      var random = generateRandomInteger(0, 100);
      if (random > (100 - followsPercentage)) {
        document.querySelector(followButtonClassSelector).click();
        followCount++;
        var name = document.querySelector(usernameClassSelector).textContent;
        console.log("Followed " + name + " (" + followCount + ")");
      }
    }

    /**
     * Wait 1 second and go to next photo
     */
    function scheduleGoToNextPhoto(prefs) {
      setTimeout(function() {
        goToNextPage(prefs);
      }, 1000);
    }

		/**
		 * Set botRunning to false to label the bot as stopped and notify the user.
		 */
    function stopBot() {
      console.log("stopping")
      window.botRunning = false;
      notifyUser("IG Autolike stopped", "Page: " + document.title);
    }

		/**
		 * If the element received is null stop the bot.
		 * Otherwise return true
		 */
    function checkElementOrStop(element) {
      if (element != null) {
        return true;
      } else {
        stopBot();
        return false;
      }
    }

  }
})();
