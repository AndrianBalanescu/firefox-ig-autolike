/* eslint no-unused-vars: "off" */

function getProfileJson(username) {
  return fetch('https://www.instagram.com/' + username + '/?__a=1')
    .then(function(response) {
      return response.json();
    }).then((json) => {
      return json;
    }).catch((err) => {
      console.log(err);
    });
}
