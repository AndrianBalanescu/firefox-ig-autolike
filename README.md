# firefox-ig-autolike
Instagram Auto-like extension for Firefox written using Firefox WebExtensions APIs.

1. Install the extension ( [web-ext-artifacts/ig_autolike-XXX.xpi](https://github.com/vinsce/firefox-ig-autolike/blob/master/web-ext-artifacts/ig_autolike-0.1.8.1.xpi) );
2. Open a page in the form:
  * https://www.instagram.com/explore/tags/yazzy where **yazzy** is the tag of the photos you want to like; or
  * https://www.instagram.com/vinsce where **vinsce** is the username of the user you want to like
3. Open a photo from the page above
4. Click on the IG Autolike button from the Firefox top bar

## Preferences
#### Times
min and max like times are used to generate a random interval to put a new like. Values should be specified in milliseconds.  
Don't use very small values or you could be blocked.

#### Random follows
You can enable auto-follow feature.
The percentage of follows is an integer between 1 and 100.  
100 means that all the users are followed.  
50 means that only half of the users are followed.

#### Conditions
You can specify to like/follow only users that satisfy the given following over followers ratio.  
In pratice, the bot likes only if: following/followers >= ratio.  
If ratio is 1: like only to users who have more following than followers.

![screenshot](https://cloud.githubusercontent.com/assets/5099266/20863013/a22490f4-b9bc-11e6-8f82-54daeec52298.png)
