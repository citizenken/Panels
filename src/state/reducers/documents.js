var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function documentReducer(documents = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.ADD_DOCUMENT:
      return Immutable.set(documents, action.document.id, action.document);
    case actionTypes.DELETE_DOCUMENT:
      return Immutable.without(documents, action.document.id);
    case actionTypes.UPDATE_DOCUMENT:
      return Immutable.set(documents, action.document.id, action.document);
    case actionTypes.LOAD_DOC:
      return Immutable.set(documents, action.document.id, action.document);
    default:
      return documents;
  }
}