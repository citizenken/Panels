var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');

module.exports = {
  Document,
  updateOnCMChange
}

function Document(id, title, scriptType) {
  if (!id) {
    id = randomstring.generate(20)
  }
  return Immutable({
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
};

function updateOnCMChange(doc, c, change) {
  var updated = Immutable.merge(doc, {
    history: doc.history.concat(doc.modifiedOn),
    content: c.getValue(),
    modifiedOn: Date.now(),
  });

  if (doc.title === 'Untitled' || doc.title.length < 10) {
    updated = Immutable.set(updated, 'title', updated.content.substring(0,10));
  }
  rendererStore.dispatch(actions.updateDoc(updated));
  return updated;
};