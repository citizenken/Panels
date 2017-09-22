var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function documentReducer(documents = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.ADD_DOCUMENT:
      console.log('add');
      return Immutable.set(documents, action.document.id, action.document);
    case actionTypes.UPDATE_DOCUMENT:
      console.log('update');
      return Immutable.set(documents, action.document.id, action.document);
    case actionTypes.LOAD_DOC:
      console.log('loaded');
      return Immutable.set(documents, action.document.id, action.document);
    default:
      return documents;
  }
}