var firebase = require('firebase');
var oauthService = require('./oauth-service.js');
var mainStore = require('../mainStore.js');
var actions = require('../state/actions/actions');
var axios = require('axios');
var User = require('../models/user');
var Document = require('../models/document');
var Immutable = require('seamless-immutable');

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
  collabCursorQuery: null,
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
  createUser: function(user) {
    return new Promise(function(resolve) {
      resolve(new User.User(user));
    });
  },
  loadUser: function (user) {
    var self = this;

    return firebase.database().ref('/users/' + user.uid + '')
            .once('value')
            .then(function(userSnapshot) {
              var userObj = userSnapshot.val();
              if (userObj === null) {
                return self.createUser(user)
                .then(function () {
                  return self.loadUser(user);
                });
              } else {
                self.firebaseUser = userObj;
                return userObj;
              }
            });
  },
  loadUserFiles: function(user) {
    var self = this,
        filesToRetrieve = Object.keys(user.files).length,
        retrievedFiles = {},
        filesToLoad = {};

    var query = firebase.database().ref('/files')
        .orderByChild('author')
        .equalTo(user.id);
    query.on('child_added', function(snapshot) {
      var doc = snapshot.val();
      if (!doc.deleted) {
        mainStore.dispatch(actions.loadDoc(doc));
      }
    });
    query.on('child_changed', function(snapshot) {
      self.detectFileChanges(snapshot);
    });
  },
  detectFileChanges: function(snapshot) {
    var updated = Immutable(snapshot.val())
    storedDoc = mainStore.getState().documents[updated.id];

    if (Document.hasRemoteContentUpdated(storedDoc, updated)) {
      mainStore.dispatch(actions.updateDoc(updated));
    }
  },
  addFileToUser: function(fileID) {
    var self = this;
    firebase.database().ref('/users/' + self.firebaseUser.id + '/files/' + fileID).set(true)
      .then(function() {
        console.log('firebase user add complete');
      })
      .catch(function(error) {
        console.log('a firebase error', error)
      });

  },
  writeRemoteFile: function(file) {
    firebase.database().ref('/files/' + file.id).set(file)
      .then(function() {
        console.log('firebase update complete');
      })
      .catch(function(error) {
        console.log('a firebase error', error)
      });
  },
  updateUserCurrentFile: function(fileID) {
    var self = this;
    firebase.database().ref('/users/' + self.firebaseUser.id + '/currentFile/id').set(fileID)
      .then(function() {
        console.log('firebase update current file complete');
      })
      .catch(function(error) {
        console.log('a firebase error', error)
      });
  },
  updateUserCursor: function(cursor) {
    var self = this;
    firebase.database().ref('/users/' + self.firebaseUser.id + '/currentFile/currentCursorPosition').set(cursor)
      .then(function() {
        console.log('firebase update complete');
      })
      .catch(function(error) {
        console.log('a firebase error', error)
      });
  },
  getCurrentCollaboratorCursors: function(docID) {
    var self = this,
        collaboratorCursors = [];

    if (self.collabCursorQuery) {
      self.collabCursorQuery.off();
    }

    var query = firebase.database().ref('/users')
      .orderByChild('currentFile/id')
      .equalTo(docID);
    self.collabCursorQuery = query;
    query.on('child_added', function(snapshot) {
      self.updateCollabCursor(snapshot);
    });
    query.on('child_changed', function(snapshot) {
      self.updateCollabCursor(snapshot);
    });
    query.on('child_removed', function(snapshot) {
      mainStore.dispatch(actions.removeCollabCursor(snapshot.val().id));
    });
  },
  updateCollabCursor: function(snapshot) {
    var self = this,
        collab = snapshot.val();
    if (collab.id !== self.firebaseUser.id) {
      mainStore.dispatch(actions.collabCursorUpdate(collab.id, collab.currentFile.currentCursorPosition));
    }
  }
}








