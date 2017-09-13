var dns = require('dns');

module.exports = {
  nodeCheckInternet
}

function nodeCheckInternet() {
  return new Promise(function (resolve, reject) {
    dns.lookup('google.com', function(err) {
      if (err && err.code == "ENOTFOUND") {
          reject(false);
      } else {
          resolve(true);
      }
    });
  });
}