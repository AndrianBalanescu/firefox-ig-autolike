function notifyUser(title, message) {
  browser.runtime.sendMessage({
    title: title,
    message: message
  });
}

function generateRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max + 1 - min));
}
