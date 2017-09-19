var m = require('mithril')
var path = require('path');
var Tabs = require('./tabs')
var Sidebar = require('./sidebar')
var rendererStore = require('../rendererStore');
// var oauthService = require('../services/oauth-service.js');
var firebasePath = path.resolve(__dirname, '..', 'services', 'firebase-service.js');
var firebaseService = require('electron').remote.require(firebasePath);
var config = require('electron').remote.getGlobal('config');
// var firebaseService = require('electron').remote.getGlobal('firebaseService');
var root = document.body

firebaseService.app.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('this is a user', user.uid)
  } else {
    // No user is signed in.
  }
});


var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  // console.log(stateData);
  m.redraw();
});

var Main = {
  view: function() {
    return m(".main", [
      m(Sidebar, {stateData: stateData}),
      m(Tabs, {stateData: stateData})
    ])
  }
}

m.mount(root, Main)