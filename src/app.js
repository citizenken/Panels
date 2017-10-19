const electron = require('electron');
var path = require('path');
var mainStore = require('./mainStore');
var actions = require('./state/actions/actions');
var configService = require('./services/config-service.js');
var onlineService = require('./services/online-service.js')
const app = electron.app;

module.exports = {
  loadConfig,
  initialize,
  logOutUser
}

function loadConfig() {
  var config = configService.loadConfig(app.getPath('userData'));
  global.config = config;
  mainStore.dispatch(actions.loadConfig(config));
  console.log(mainStore.getState())
  return config;
}

function initialize(config) {
  mainStore.dispatch(actions.showLoading());
  onlineService.nodeCheckInternet()
  .then(function() {
    if (config.allowInternet) {
      initializeFirebase();
    }
  })
  .catch(function(error) {
    mainStore.dispatch(actions.hideOverlay());
    console.log('this is an error', error)
    console.info('No internet access, not loading firebase')
  });
}

function initializeFirebase(config) {
  var firebaseService = require('./services/firebase-service.js').FirebaseService();
  global.firebaseService = firebaseService;

  return firebaseService.signIn()
  .then(function (user) {
    mainStore.dispatch(actions.userLogin(user));
    return firebaseService.loadUserFiles(user);
  })
  .then(function(files) {
    mainStore.dispatch(actions.hideOverlay());
  });
}

function logOutUser() {
  var oauthService = require('./services/oauth-service.js');
  mainStore.dispatch(actions.updateConfig({key:'refreshToken', value: ''}));
  mainStore.dispatch(actions.userLogout());
  oauthService.logOut()
  .then(function(response) {
    console.log(response.data);
    initialize(loadConfig());
  });
}