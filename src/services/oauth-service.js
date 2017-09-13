var BrowserWindow = require('electron').BrowserWindow || require('electron').remote.BrowserWindow,
    mainStore = require('../mainStore.js'),
    oauthRoot = mainStore.getState().sysConfig.oauthRoot,
    redirectUri = oauthRoot + 'callback', // jscs:disable
    authEndPoint = oauthRoot,
    logOutEndpoint = oauthRoot + 'logout';

module.exports = {
  authWindow: null,
  accessToken: null,
  googleOauth: function (promptForAccount) {
    var self = this,
    authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false }),
    prompt = (!promptForAccount) ? 'select_account' : '';
    this.authWindow = authWindow;


    return new Promise(function (resolve, reject) {
        authWindow.loadURL(authEndPoint);
        authWindow.once('ready-to-show', function () {
          try {
            authWindow.show();
          } catch (err) {
            console.log('caught show error', err);
          }
        });

        authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
          newUrl = unescape(newUrl);
          if (newUrl.split('?')[0].indexOf(redirectUri) === 0) {
            authWindow.destroy();
            var tokens = {
              idToken: newUrl.match(/id_token=([^&#]+)/)[1],
              refreshToken: newUrl.match(/refresh_token=([^&#]+)/)[1],
            }
            resolve(tokens);
          }
        });

        authWindow.on('close', function() {
            authWindow = null;
            self.authWindow = null;
        }, false);
      });
  },

  // logOut: function (url) {
  //   return $http({url: logOutEndpoint, method: 'GET'})
  //   .then(function (response) {
  //     return response;
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
  // }
};