var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function tabReducer(tabs = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.OPEN_DOCUMENT:
      return Immutable.set(tabs, action.tab.docId, action.tab);
    default:
      return tabs;
  }
}