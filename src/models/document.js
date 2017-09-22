var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var actions = require('../state/actions/actions');
var stateStore = undefined;
var deepEqual = require('deep-equal');
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
  hasRemoteContentUpdated,
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

  // stateStore.dispatch(actions.updateDoc(updated));
  // firebaseService.updateRemoteFile(updated);
  return updated;
};

function emitChanges(updated) {
  stateStore.dispatch(actions.updateDoc(updated));
  firebaseService.writeRemoteFile(updated);
}

function hasRemoteContentUpdated(local, remote) {
  if (local && remote && !deepEqual(local, remote)) {
    if (local.modifiedOn < remote.modifiedOn &&
      local.content !== remote.content) {
      return true;
    }
  }
  return false;
}

function setAsCurrentDoc(docID, cm) {
  firebaseService.updateUserCurrentFile(docID);
  firebaseService.getCurrentCollaboratorCursors(docID);
  stateStore.dispatch(actions.changeCurrentDoc(docID));
  if (cm) {
    upateCursorLocation(cm);
  }
}

function upateCursorLocation(cm) {
  var rawCursor = cm.getCursor();
  console.log(rawCursor)
  var cursor = {
        line: rawCursor.line,
        ch: rawCursor.ch
      };
  firebaseService.updateUserCursor(cursor);
  stateStore.dispatch(actions.userCursorUpdate(cursor));
}
