/*
A service to interact with Firebase.

Call constructor to return an instance of the service
*/


var firebase = require('firebase');
var oauthService = require('./oauth-service.js');
var mainStore = require('../mainStore.js');
var actions = require('../state/actions/actions');
var axios = require('axios');
var User = require('../models/user');
var Document = require('../models/document');
var Immutable = require('seamless-immutable');

/**
 * Firebase config object. Pull API key from environment
 */
var config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "panels-fd87e.firebaseapp.com",
  databaseURL: "https://panels-fd87e.firebaseio.com",
  projectId: "panels-fd87e",
  storageBucket: "panels-fd87e.appspot.com",
  messagingSenderId: "537455563422"
};

module.exports = {
  FirebaseService
}

/**
 * Create a new instance of the FirebaseService
 */
function FirebaseService() {
  var firebaseService = {
    app: null,
    firebaseUser: null,
    collabCursorQuery: null,
    /**
     * Sign in the user, either with an OAuth flow, or with a stored refresh token.
     * After successfull login, load the user record using the authentication data
     * @return {promise} User Loaded user from Firebase
     */
    signIn: function() {
      var refreshToken = mainStore.getState().sysConfig.refreshToken,
          oauthRoot = mainStore.getState().sysConfig.oauthRoot,
          self = this;

      if (!refreshToken) {
        return oauthService.googleOauth()
                .then(function(tokens) {
                  // Store the refresh token to the local config file
                  mainStore.dispatch(actions.updateConfig({key:'refreshToken', value: tokens.refreshToken}))
                  // Create a firebase credential with the fetched token, and auth with that
                  var credential = firebase.auth.GoogleAuthProvider.credential(tokens.idToken);
                  return firebase.auth().signInWithCredential(credential)
                })
                .then(function(user) {
                  return self.loadUser(user);
                })
                .catch(function(error) {
                  // TODO: Handle errors in the login flow
                  console.log('something errored');
                  console.log(error);
                });
      } else {
        // If the refresh token is stored locally, refresh the access token, and use that to auth into firebase
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
    /**
     * Create a new User instance
     * @param  {obj} user Google authenticated user object
     * @return {promise} User Instance of Panels user
     */
    createUser: function(user) {
      return new Promise(function(resolve) {
        resolve(new User.User(user));
      });
    },
    /**
     * Query firebase to get user details, or create a new user if details don't exist
     * @param  {obj} user Google authenticated user object
     * @return {promise} User Firebase user instance
     */
    loadUser: function (user) {
      var self = this;
      return firebase.database().ref('/users/' + user.uid + '')
              .once('value')
              .then(function(userSnapshot) {
                var userObj = userSnapshot.val();
                // If user doesn't exist in firebase, create a new one with Google user object, and load that user
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
    /**
     * Load a user's files from Firebase into the Redux state
     * Register events for Firebase events
     * @param  {obj} User Firebase user instance
     * @return {none}
     */
    loadUserFiles: function(user) {
      var self = this,
          queryParams = {
            'author': user.id
          }

      queryParams['collaborators/' + user.id] = [
        'view',
        'edit',
        'suggest'
      ]

      for (var qp in queryParams) {

        if (typeof queryParams[qp] === 'string') {
          self.queryForFiles(qp, queryParams[qp]);
        } else if (Array.isArray(queryParams[qp])) {
          for (var i = queryParams[qp].length - 1; i >= 0; i--) {
            var equalTo = queryParams[qp][i];
            self.queryForFiles(qp, equalTo);
          }
        }
      }
    },
    /**
     * Query for files and set listeners for those files
     * @return {str} orderByChild The child property to order by
     * @return {str} equalTo The value of that property to filter by
     */
    queryForFiles: function(orderByChild, equalTo) {
      var self = this,
          fileQuery = firebase.database().ref('/files')
          .orderByChild(orderByChild)
          .equalTo(equalTo);

      fileQuery.on('child_added', function(snapshot) {
        var doc = snapshot.val();
        // We only want docs not marked 'deleted'
        if (!doc.deleted) {
          mainStore.dispatch(actions.loadDoc(doc));
        }
      });

      fileQuery.on('child_changed', function(snapshot) {
        self.detectFileChanges(snapshot);
      });
    },
    /**
     * Detect if the remote reference in Firebase is different from the local version
     * Trigger Redux action to update document if differences detected
     * @param  {obj} snapshot Document snapshot from Firebase
     * @return {none}
     */
    detectFileChanges: function(snapshot) {
      var updated = Immutable(snapshot.val())
          storedDoc = mainStore.getState().documents[updated.id];

      if (Document.getRemoteFileDiff(storedDoc, updated).length > 0) {
        mainStore.dispatch(actions.updateDoc(updated));
      }
    },
    /**
     * Add a file to a user, making that user the file's author
     * @param {str} fileID ID of file to add to a user's files object in Firebase
     * @return {none}
     */
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
    /**
     * Write a file to Firebase
     * @param  {obj} file Document instance
     * @return {none}
     */
    writeRemoteFile: function(file) {
      firebase.database().ref('/files/' + file.id).set(file)
        .then(function() {
          console.log('firebase update complete');
        })
        .catch(function(error) {
          console.log('a firebase error', error)
        });
    },
    /**
     * Update the file that a user is currently working on
     * @param  {str} fileID ID of the file currently being edited
     * @return {none}
     */
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
    /**
     * Uodate the cursor location for the current file a user is editing
     * @param  {obj} cursor A Codemirror cursor object, containing line and column positions
     * @return {none}
     */
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
    /**
     * Get the cursors of people looking at the current file as the local user
     * Create a query for all users looking at the current ID
     * Register listeners to handle cursor updates
     * @param  {str} docID The ID of the local current doc
     * @return {none}
     */
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
        var collab = snapshot.val();
        // If someone navigates away from the current document, remove them from the collab cursor object
        // since they are no longer currently collaborating
        if (collab.id !== self.firebaseUser.id) {
          mainStore.dispatch(actions.removeCollabCursor(collab.id, docID));
        }
      });
    },
    /**
     * Update the local Redux state with the new cursor location for this collaborator
     * @param  {obj} snapshot Firebase user snapshot
     * @return {none}
     */
    updateCollabCursor: function(snapshot) {
      var self = this,
          collab = snapshot.val();
      // Don't update if the collaborator change is the local user
      if (collab.id !== self.firebaseUser.id) {
        mainStore.dispatch(actions.collabCursorUpdate(collab.id, collab.currentFile.currentCursorPosition, collab.currentFile.id));
      }
    },
    /**
     * @param  {str} userID ID of the user to get details about
     * @return {promise} Returns user data from Firebase
     */
    getUser: function(userID) {
      return firebase.database().ref('/users/' + userID)
              .once('value')
              .then(function(userSnapshot) {
                return userSnapshot.val();
              });
    },
    /**
     * Get details about each user collaborating on a document
     * @param  {obj} doc Document instance
     * @return {promise} A list of user objects containing user details
     */
    getCollaborators: function(doc) {
      var self = this,
          collabs = Object.keys(doc.collaborators),
          promises = [];
      for (var c in collabs) {
        var promise = self.getUser(collabs[c]);
        promises.push(promise);
      }
      // When all promises are finished, return the collab object with full data
      return Promise.all(promises)
              .then(function(values) {
                var fullCollabs = {};
                for (var v in values) {
                  var collab = values[v];
                  fullCollabs[collab.id] = collab;
                }
                return fullCollabs;
              });
    },
    /**
     * Search for a user, filtering based on user input in search bar
     * @param  {str} searchTerm String to use for filtering users
     * @param  {Function} callback Function to call when users are added to the results set
     * @return {none}
     */
    searchForCollab: function(searchTerm, callback) {
      var users = {};

      var query = firebase.database().ref('/users')
        .orderByChild('username')
        .startAt(searchTerm);

      query.on('child_added', callback);
    },
    /**
     * Iterate over list of collaborator IDs, granting them access to a document
     * @param {array} collaborators A list of collaborator IDs
     * @param {str} collabRole Role to assign each collaborator
     * @param {str} docID Document to get a new collaborator
     * @return {promise} Return list of promises
     */
    addCollaborators: function(collaborators, collabRole, docID) {
      var promises = [];
      for (var c in collaborators) {
        var collab = collaborators[c];
        var collabFilePromise = firebase.database().ref('/users/' + collab + '/collabFiles/' + docID).set(collabRole)
          .then(function() {
            console.log('Collab ' + collab + ' given ' + collabRole + ' to ' + docID);
          });
        var fileCollabPromise = firebase.database().ref('/files/' + docID + '/collaborators/' + collab).set(collabRole)
          .then(function() {
            console.log('Collab ' + collab + ' added to ' + docID + ' as ' + collabRole);
          });
        promises.push(collabFilePromise, fileCollabPromise);
      }
      return Promise.all(promises);
    },
    /**
     * Remove collaborator access from a document
     * @param  {str} collabID ID of user to remove access for
     * @param  {str} docID ID of the doc to remove from collaborator access
     * @return {promise} Return list of promises
     */
    removeCollaborators: function(collabID, docID) {
      var promises = [];
      var collabFilePromise = firebase.database().ref('/users/' + collabID + '/collabFiles/' + docID).remove()
        .then(function() {
          console.log('Collab ' + collabID + ' removed from ' + docID);
        });
      var fileCollabPromise = firebase.database().ref('/files/' + docID + '/collaborators/' + collabID).remove()
        .then(function() {
          console.log('Collab ' + collabID + ' removed from ' + docID);
        });
      promises.push(collabFilePromise, fileCollabPromise);

      return Promise.all(promises);
    },
    saveComment: function(comment) {
      var promises = [];

      var filePromise = firebase.database().ref('/files/' + comment.doc + '/comments/' + comment.id).set(true)
        .then(function() {
          console.log('firebase update complete');
        })
        .catch(function(error) {
          console.log('a firebase error', error)
        });

      var commentPromise = firebase.database().ref('/comments/' + comment.id).set(comment)
        .then(function() {
          console.log('firebase update complete');
        })
        .catch(function(error) {
          console.log('a firebase error', error)
        });

      return Promise.all(promises);
    },
    getCurrentComments: function(docID) {
      var self = this,
          comments = [];

      if (self.collabCursorQuery) {
        self.collabCursorQuery.off();
      }

      var query = firebase.database().ref('/comments')
        .orderByChild('doc')
        .equalTo(docID);
      self.commentQuery = query;

      query.on('child_added', function(snapshot) {
        var comment = snapshot.val();
        mainStore.dispatch(actions.commentUpdate(comment));
      });
      query.on('child_changed', function(snapshot) {
        var comment = snapshot.val();
        mainStore.dispatch(actions.commentUpdate(comment));
      });
      // query.on('child_removed', function(snapshot) {
      //   var collab = snapshot.val();
      //   // If someone navigates away from the current document, remove them from the collab cursor object
      //   // since they are no longer currently collaborating
      //   if (collab.id !== self.firebaseUser.id) {
      //     mainStore.dispatch(actions.removeComment(collab.id, docID));
      //   }
      // });
    },
  }

  if (!firebase.apps.length) {
    firebaseService.app = firebase.initializeApp(config);
  } else {
    firebaseService.app = firebase.apps[0];
  }

  return firebaseService
}








