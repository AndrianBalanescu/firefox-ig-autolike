(function() {

  const likeElementClassSelector = '.coreSpriteLikeHeartOpen, .coreSpriteHeartOpen, .ptsdu';
  const nextElementClassSelector = '.coreSpriteRightPaginationArrow, ._1bdSS';
  const followButtonClassSelector = ".oW_lN";
  const usernameClassSelector = ".nJAzx";

  // Statistics
  var likeCount = 0;
  var followCount = 0;
  var commentsCount = 0;

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
      var botRunning = window.botRunning || false;
      console.info("botRunning: " + botRunning);
      var botStatus = {
        botRunning: botRunning,
        likeCount: likeCount,
        followCount: followCount,
        commentsCount: commentsCount
      };
      console.info(JSON.stringify(botStatus, null, 4));
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
      console.log(prefs);
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
          })
          .catch(function(error) {
            // If it's impossible to fetch the user's profile -> no check and schedule actions
            console.log(error);
            scheduleActionsOnCurrentPage(prefs);
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
          .catch(function(error) {
            console.log(error);
            nextElement.click();
            startBot(prefs);
          });
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
      var username = document.querySelector(usernameClassSelector).textContent;

      if (!window.botRunning) return;

      if (prefs.enableComment) {
        console.log("Commenti attivi, random comment. " + prefs.commentText);
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
                /*browser.runtime.sendMessage({
                  command: "comment",
                  mediaId: mediaId,
                  commentText: commentText,
                  csrftoken: getCookie("csrftoken")
                });*/

                const headers = {
                  "Content-type": "application/x-www-form-urlencoded",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRFToken": getCookie("csrftoken"),
                  "X-Instagram-AJAX": "1",
                  //"Host": 'www.instagram.com',
                  //"Origin": 'https://www.instagram.com',
                  //"Referer": 'https://www.instagram.com/'
                };
                console.log(headers);
                content.fetch("https://www.instagram.com/web/comments/" + mediaId + "/add/", {
                    headers: headers,
                    body: "comment_text=" + commentText + "&replied_to_comment_id=",
                    method: "POST"
                  }).then(res => console.log(res))
                  .catch(error => console.log(error))


                /*var xhttp2 = new content.XMLHttpRequest();
                xhttp2.open("POST", "https://www.instagram.com/web/comments/" + mediaId + "/add/", true);
                xhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhttp2.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
                xhttp2.setRequestHeader("X-Instagram-AJAX", "1");
								//xhttp2.setRequestHeader('Host', 'www.instagram.com');
								//xhttp2.setRequestHeader("Origin", 'https://www.instagram.com');
								//xhttp2.setRequestHeader('Referer', 'https://www.instagram.com/');
                console.log(xhttp2);
                xhttp2.onreadystatechange = function() {
                  console.log(xhttp2)
                };
                xhttp2.send("comment_text=" + commentText + "&replied_to_comment_id=");*/
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
