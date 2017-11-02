var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function cursorsReducer(cursors = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.USER_CURSOR_UPDATE:
      return Immutable.setIn(cursors, [action.docID, 'currentCursorPosition'], action.cursor);
    case actionTypes.COLLAB_USER_CURSOR_UPDATE:
      return Immutable.setIn(cursors, [action.docID, 'collabCursors', action.collabID], action.cursor);
    case actionTypes.REMOVE_COLLAB_USER_CURSOR:
      if (cursors[action.docID].collabCursors) {
        return Immutable.setIn(cursors, [action.docID, 'collabCursors'], Immutable.without(cursors[action.docID].collabCursors, action.collabID));
      } else {
        return cursors;
      }
    default:
      return cursors;
  }
}