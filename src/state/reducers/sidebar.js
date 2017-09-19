var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function sidebarReducer(sidebarConfig = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.RESIZE_SIDEBAR:
      return Immutable.set(sidebarConfig, 'width', action.width);
    default:
      return sidebarConfig;
  }
}