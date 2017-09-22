var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function currentDocumentReducer(currentDoc = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.CHANGE_CURRENT_DOCUMENT:
      console.log('change_doc')
      return Immutable.set(currentDoc, 'id', action.docId);
    case actionTypes.USER_CURSOR_UPDATE:
      console.log('cursor_move')
      return Immutable.set(currentDoc, 'currentCursorPosition', action.cursor);
    case actionTypes.COLLAB_USER_CURSOR_UPDATE:
      return Immutable.setIn(currentDoc, ['collabCursors', action.collabID], action.cursor);
    case actionTypes.REMOVE_COLLAB_USER_CURSOR:
      console.log('removing user')
      return Immutable.set(currentDoc, 'collabCursors', Immutable.without(currentDoc.collabCursors, action.collabID));
    default:
      return currentDoc;
  }
}