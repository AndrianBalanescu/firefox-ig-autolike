function saveLogOld(type, message, url) {
  const date = getFormattedTodayDate();
  const obj = [{
    "date": date,
    "type": type,
    "url": url
  }];
  browser.storage.local.set({
    date: obj
  }).then(result => console.log("inserted: " + result), error => console.log(error));
  browser.storage.local.set({
    "date": date,
  }).then(result => console.log("inserted: " + result), error => console.log(error));
  browser.storage.local.get().then(result => console.log(result)).catch(err => console.log(err));
}

function saveLog(type, message, url) {
  var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  var request = indexedDB.open("BotDatabase", 2);
  request.onerror = function(event) {
    console.log(event);
  };
  request.onsuccess = function(event) {
    console.log("Success: " + event);

    var db = event.target.result;
    db.onerror = function(event) {
      // Generic error handler for all errors targeted at this database's
      // requests!
      console.log("Database error: " + event.target.errorCode);
    };
    var transaction = db.transaction(["logs"], "readwrite");
    transaction.oncomplete = function(event) {
      console.log("All done! Transaction complete");
    };

    transaction.onerror = function(event) {
      console.log("Errore inserimento in db");
			console.log(event);
    };

    var objectStore = transaction.objectStore("logs");
		const date = getFormattedTodayDate();

    var request = objectStore.add({
      "date": date,
      "type": type,
      "url": url
    });
    request.onsuccess = function(event) {
      console.log("Inserimento ok");
			console.log(event);
    };

  };
  // This event is only implemented in recent browsers
  request.onupgradeneeded = function(event) {
    // Save the IDBDatabase interface
    var db = event.target.result;

    // Create an objectStore for this database
    var objectStore = db.createObjectStore("logs", {
      autoIncrement: true
    });
    objectStore.createIndex("date", "date", {
      unique: false
    });
    objectStore.createIndex("type", "type", {
      unique: false
    });
  };
}

function getFormattedTodayDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  return dd + "-" + mm + "-" + yyyy;
}
