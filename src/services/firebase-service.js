var firebase = require('firebase');
var oauthService = require('./oauth-service.js');
var mainStore = require('../mainStore.js');
var actions = require('../state/actions/actions');
var axios = require('axios');

var config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "panels-fd87e.firebaseapp.com",
  databaseURL: "https://panels-fd87e.firebaseio.com",
  projectId: "panels-fd87e",
  storageBucket: "panels-fd87e.appspot.com",
  messagingSenderId: "537455563422"
};

module.exports = firebaseService = {
  app: firebase.initializeApp(config),
  firebaseUser: null,
  signIn: function(token) {
    var refreshToken = mainStore.getState().sysConfig.refreshToken,
        oauthRoot = mainStore.getState().sysConfig.oauthRoot,
        self = this;

    if (!refreshToken) {
      return oauthService.googleOauth()
              .then(function(tokens) {
                mainStore.dispatch(actions.updateConfig({key:'refreshToken', value: tokens.refreshToken}))
                var credential = firebase.auth.GoogleAuthProvider.credential(tokens.idToken);
                return firebase.auth().signInWithCredential(credential)
              })
              .then(function(user) {
                return self.loadUser(user);
              })
              .catch(function(error) {
                console.log('something errored');
                console.log(error);
              });
    } else {
      return axios.get(oauthRoot + 'refresh?refresh_token=' + refreshToken)
              .then(function (response) {
                var credential = firebase.auth.GoogleAuthProvider.credential(response.data);
                return firebase.auth().signInWithCredential(credential)
                        .then(function(user) {
                          return self.loadUser(user);
                        });
              })
              .catch(function (error) {
                console.log('this is an error', error);
              });
    }
  },
  loadUser: function (user) {
    var self = this;
    return firebase.database().ref('/users/' + user.uid + '')
            .once('value')
            .then(function(userSnapshot) {
              var userObj = userSnapshot.val();
              self.firebaseUser = userObj;
              return userObj;
            });
  },
  loadUserFiles: function(user) {
    var filesToRetrieve = Object.keys(user.files).length,
        retrievedFiles = {},
        filesToLoad = {};
    return new Promise(function(resolve) {
      firebase.database().ref('/files')
        .orderByChild('author')
        .equalTo(user.id)
        .on('child_added', function(snapshot) {
          var doc = snapshot.val();
          if (!doc.deleted) {
            filesToLoad[doc.id] = doc;
          }
          retrievedFiles[doc.id] = doc;
          if (Object.keys(retrievedFiles).length === filesToRetrieve) {
            resolve(filesToLoad);
          }
        });
    })
  }
}