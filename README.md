# firefox-ig-autolike
Instagram bot for auto like, comments and follows.  
Extension for Firefox written using Firefox WebExtensions APIs.

1. Install the extension ([Firefox Add-ons](https://addons.mozilla.org/firefox/addon/ig-autolike/));
2. Open a page in the form:
  * https://www.instagram.com/explore/tags/yazzy where **yazzy** is the tag of the photos you want to like/comment/follow; or
  * https://www.instagram.com/vinsce where **vinsce** is the username of the user you want to like/comment
3. Open a photo from the page above
4. Click on the IG Autolike button from the Firefox top bar and start the bot

## Preferences
#### Times
min and max like times are used to generate a random interval to put a new like. Values should be specified in milliseconds.  
Don't use very small values or you could be blocked.

#### Random follows
You can enable auto-follow feature.
The percentage of follows is an integer between 1 and 100.  
100 means that all the users are followed.  
50 means that only half of the users are followed.

#### Random comments
You can enable auto-comment feature.
The percentage of comments is an integer between 1 and 100.  
100 means that all of the photos will be commented.  
50 means that only half of the photos will be commented.

You can specify the text of the comments, one per line. The text `{username}` will be replaced with the username of the current user.

#### Conditions
You can specify to like/follow only users that satisfy the given following over followers ratio.  
In pratice, the bot likes only if: following/followers >= ratio.  
If ratio is 1: like only to users who have more following than followers.

![screenshot](https://addons.cdn.mozilla.net/user-media/previews/full/210/210652.png?modified=1541426243)

![screenshot](https://addons.cdn.mozilla.net/user-media/previews/full/210/210668.png?modified=1541426248)
