var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var actions = require('../state/actions/actions');
var stateStore = undefined;
var deepEqual = require('deep-equal');
var ddiff = require('deep-diff');

if (process.type !== 'browser') {
  stateStore = require('../rendererStore');
  var firebaseService = require('electron').remote.getGlobal('firebaseService');
} else {
  stateStore = require('../mainStore');
}

module.exports = {
  Document,
  updateOnCMChange,
  emitChanges,
  getRemoteFileDiff,
  setAsCurrentDoc,
  upateCursorLocation
}

function Document(id, title, scriptType) {
  if (!id) {
    id = randomstring.generate(20)
  }

  var doc = Immutable({
    id: id,
    title: title || null,
    createdOn: Date.now(),
    modifiedOn: Date.now(),
    author: null,
    content: '',
    sync: false,
    type: scriptType,
    history: [],
    collaborators: {},
    related: [],
    cursor: null,
    deleted: false,
    history: []
  })

  if (firebaseService) {
    doc = Immutable.set(doc, 'author', firebaseService.firebaseUser.id);
    firebaseService.addFileToUser(doc.id);
    firebaseService.writeRemoteFile(doc);
  }
  return doc;
};

function updateOnCMChange(doc, c, change) {
  var updated = Immutable.merge(doc, {
    // history: doc.history.concat(doc.modifiedOn),
    content: c.getValue(),
    modifiedOn: Date.now(),
  });

  if (doc.title === 'Untitled' || doc.title.length < 10) {
    updated = Immutable.set(updated, 'title', updated.content.substring(0,10));
  }

  return updated;
};

function emitChanges(updated) {
  stateStore.dispatch(actions.updateDoc(updated));
  firebaseService.writeRemoteFile(updated);
}

function getRemoteFileDiff(local, remote) {
  if (local && remote && !deepEqual(local, remote)) {
    var diff = ddiff(local, remote),
        changes = diff.map(function(d) {
          var c = [];
          for (var p in d.path) {
            c.push(d.path[p]);
          }
          return c;
        });

    return [].concat.apply([], changes);
  }
  return [];
}

function setAsCurrentDoc(docID, cm) {
  firebaseService.updateUserCurrentFile(docID);
  firebaseService.getCurrentCollaboratorCursors(docID);
  firebaseService.getCurrentComments(docID);
  stateStore.dispatch(actions.changeCurrentDoc(docID));
  if (cm) {
    upateCursorLocation(cm, docID);
  }
}

function upateCursorLocation(cm, docID) {
  var rawCursor = cm.getCursor();

  var cursor = {
        line: rawCursor.line,
        ch: rawCursor.ch
      };
  firebaseService.updateUserCursor(cursor);
  console.log(docID)
  stateStore.dispatch(actions.userCursorUpdate(cursor, docID));
}
