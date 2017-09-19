var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
// var path = require('path');
// var firebasePath = path.resolve(__dirname, '..', 'services', 'firebase-service.js');
// var firebaseService = require('electron').remote.require(firebasePath);
if (require('electron').remote) {
  var firebaseService = require('electron').remote.getGlobal('firebaseService') || undefined;
}

var deepEqual = require('deep-equal');

module.exports = {
  Document,
  updateOnCMChange,
  emitChanges,
  hasRemoteContentUpdated
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
  rendererStore.dispatch(actions.updateDoc(updated));
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
