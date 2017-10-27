var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function currentDocumentReducer(currentDoc = Immutable(''), action) {
  switch(action.type) {
    case actionTypes.CHANGE_CURRENT_DOCUMENT:
      return action.docId;
    default:
      return currentDoc;
  }
}