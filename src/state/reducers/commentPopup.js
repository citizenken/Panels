var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function commentPopupReducer(commentPopup = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.SHOW_COMMENT_POPUP:
      return Immutable(action.position);
    case actionTypes.HIDE_COMMENT_POPUP:
      return {};
    default:
      return commentPopup;
  }
}