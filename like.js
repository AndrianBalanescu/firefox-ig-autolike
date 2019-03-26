(function() {

  const likeElementClassSelector = '.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen, .ptsdu';
  const outerLikeElementClassSelector = '.fr66n';
  const nextElementClassSelector = '.coreSpriteRightPaginationArrow, ._1bdSS';
  const followButtonClassSelector = ".oW_lN";
  const followButtonFollowingClassSelector = "_8A5w5";
  const usernameClassSelector = ".nJAzx";

  // Statistics
  var likeCount = 0;
  var followCount = 0;
  var commentsCount = 0;

  const debugFlag = true;

  function debug(message){
    if(debugFlag)
      console.log(message);
  }

  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.botLoadingHasRun) return;
  window.botLoadingHasRun = true;

  /**
   * Communication between popup and content script.
   * Set up listener:
   */
  browser.runtime.onMessage.addListener(function(message, sender, response) {
    // The popup script sends a "toggle" request to start/stop the bot.
    if (message.command === "toggle") {
      debug("Received toggle command. Previous status: " + (window.botRunning || false));
      window.botRunning = !window.botRunning; // Setting botRunning = false stops the bot
      if (window.botRunning) load(); // Load and start the bot
    } else if (message.command === "requestBotStatus") {
      var botRunning = window.botRunning || false;
      debug("Received requestBotStatus command. botRunning: " + botRunning);
      var botStatus = {
        botRunning: botRunning,
        likeCount: likeCount,
        followCount: followCount,
        commentsCount: commentsCount
      };
      debug(JSON.stringify(botStatus, null, 4));
      response(botStatus);
    }
  });

  // Send message to runtime script so it can load utils function
  browser.runtime.sendMessage({
    command: "inject"
  });

  function load() {
    debug("Loading the bot");
    // Get preferences and call loadPrefs -> starts the bot
    var prefs = browser.storage.local.get("prefs");
    prefs.then(loadPrefs).catch(err => console.log(err));

    function loadPrefs(item) {
      // Uses utils.getPrefs to merge user preferences with default preferences
      const mPrefs = getPrefs(item);

      debug("Get preferences.");
      // If the bot can be started on the current page start it and notify the user otherwise
      if (checkIfPageIsBotableAndNotifyUser()){
        startBot(mPrefs);
      }
      else {
        window.botRunning = false;
      }
    }

    /**
     * startBot() starts a single bot "iteration"
     */
    function startBot(prefs) {
      // First check if botRunning = true. If it's false return.
      if (window.botRunning) {
        debug("Starting a bot iteration. (in 2s)");
        setTimeout(function() {
          checkCurrentPage(prefs);
        }, 8000); // Wait 8 seconds and check if should perform operations on current page
      }
      else {
        debug("Bot iteration not started. botRunning is false.");
      }
    }

    /**
     * Check if should perform operations in current page based on user preferences
     */
    function checkCurrentPage(prefs) {
      debug("Checking current page");

      // First check if botRunning = true. If it's false return.
      if (!window.botRunning) {
        debug("botRunning is false. Returning.");
        return;
      }
      debug("Fetching username");
      var usernameElement = document.querySelector(usernameClassSelector);
      var username = null;

      if(usernameElement != null)
        username = usernameElement.textContent;

      debug("Username: " + username);

      if (username != null && prefs.checkFollowersRatio) { // If should check following/followers ratio
        debug("checking followers ratio");
        getProfileJson(username).then(function(profileJson) { // retrive the json of the user

            const followers = parseFollowers(profileJson);
            const following = parseFollowing(profileJson);
            const currentFollowersRatio = following / followers;

            if (currentFollowersRatio >= prefs.followersRatio) {
              // OK, like the current photo
              debug("Followers ratio ok. Scheduling action on current page.");
              scheduleActionsOnCurrentPage(prefs);
            } else {
              // Not ok, skip to next photo
              debug("Followers ratio not satisfied. Go to next page.");
              goToNextPage(prefs);
            }
          })
          .catch(function(error) {
            // If it's impossible to fetch the user's profile -> no check and schedule actions
            debug("Unable to get user profile. Scheduling action on current page.");
            console.log(error);
            scheduleActionsOnCurrentPage(prefs);
          });
      } else { // No need to check followers ratio. Just schedule operations
        debug("no need to check followers ratio. Scheduling action on current page.");
        scheduleActionsOnCurrentPage(prefs);
      }
    }

    /**
     * Check if the bot can be run on the current page and notify the user.
     */
    function checkIfPageIsBotableAndNotifyUser() {
      debug("Checking if the current page is botable");
      var nextElement = document.querySelector(nextElementClassSelector);

      if (nextElement !== null) { // If the page contains the "next" button -> start the bot
        notifyUser("Starting IG Autolike", "Page: " + document.title);
        debug("The page is botable.");
        return true;
      } else {
        notifyUser("Unable to start IG Autolike", "Page: " + document.title);
        debug("The page is not botable.");
        return false;
      }
    }

    function goToNextPage(prefs) {
      debug("Going to next page");
      // First check if botRunning = true. If it's false return.
      if (!window.botRunning){
        debug("botRunning is false. Returning.");
        return;
      }
      var nextElement = document.querySelector(nextElementClassSelector); // Try to obtain the "next" button

      if (checkElementOrStop(nextElement)) { // Check if "next" button is not null
        // If the button is available, try to fetch the next page and check the status code
        debug("Clicking next element button.");
        nextElement.click();
        debug("Requiring new bot iteration.");
        startBot(prefs);
      }
      else {
        debug("Unable to locate next element button.");
      }
    }

    /**
     * Generate a random integer representing the milliseconds to wait before clicking on like
     * based on user preferences and schedule the performActionsOnCurrentPage function call
     */
    function scheduleActionsOnCurrentPage(prefs) {
      var nextTime = generateRandomInteger(prefs.minTime, prefs.maxTime);
      console.log("Actions again in " + nextTime + " ms (" + prefs.minTime + " - " + prefs.maxTime + ")");

      nextTime = Math.max(nextTime - 8000, 1000);
      debug("scheduling next actions in: " + nextTime + " ms");
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
      debug("Performing actions on current page.");

      // First check if botRunning = true. If it's false return.
      if (!window.botRunning){
        debug("botRunning is false. Returning.");
        return;
      }

      if (prefs.enableComment) {
        console.log("Comments enabled, random comment. " + prefs.commentText);
        var username = document.querySelector(usernameClassSelector).textContent;
        comment(prefs.commentPercentage || 50, prefs.commentText, username);
      }

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
      if(likeElement == null){
        console.log('Like element is null. I\'ll try with outer like element')
        var likeElementContainer = document.querySelector(outerLikeElementClassSelector);
        if (!checkElementOrStop(likeElementContainer))
          return;
        likeElement = likeElementContainer.children[0];
        if (!checkElementOrStop(likeElement))
          return;
      }

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
        var followButton = document.querySelector(followButtonClassSelector);
        if (followButton.classList.contains(followButtonFollowingClassSelector)) // Already following
          return;
        followButton.click();
        followCount++;
        var name = document.querySelector(usernameClassSelector).textContent;
        console.log("Followed " + name + " (" + followCount + ")");
      }
    }

    function comment(commentPercentage, commentTexts, username) {
      var random = generateRandomInteger(0, 100);
      if (random > (100 - commentPercentage)) {
        commentsCount++;
        fetch(window.location.href.split('?')[0] + '?__a=1')
          .then(function(response) {
            return response.json();
          }).then((mediaJson) => {
            const mediaId = mediaJson.graphql.shortcode_media.id;
            var xhttp = new XMLHttpRequest();
            xhttp.open("HEAD", "https://www.instagram.com", true);
            xhttp.send();
            xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                var commentText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                commentText = commentText.replace(/{username}/g, "@" + username);
                console.log("token: " + getCookie("csrftoken"));

                const headers = {
                  "Content-type": "application/x-www-form-urlencoded",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRFToken": getCookie("csrftoken"),
                  "X-Instagram-AJAX": "1",
                };
                console.log(headers);
                content.fetch("https://www.instagram.com/web/comments/" + mediaId + "/add/", {
                    headers: headers,
                    body: "comment_text=" + commentText + "&replied_to_comment_id=",
                    method: "POST"
                  }).then(res => console.log(res))
                  .catch(error => console.log(error))

                console.log("Commented " + commentText + " to " + username + " (" + commentsCount + ")");
              }
            };
          }).catch((err) => {
            console.log(err);
          });
      }
    }

    /**
     * Wait 1 second and go to next photo
     */
    function scheduleGoToNextPhoto(prefs) {
      debug("Scheduling go to next photo. (in 1s)");
      setTimeout(function() {
        goToNextPage(prefs);
      }, 1000);
    }

    /**
     * Set botRunning to false to label the bot as stopped and notify the user.
     */
    function stopBot() {
      debug("bot stop required.");
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
