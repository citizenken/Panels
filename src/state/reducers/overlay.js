var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function overlayReducer(overlay = Immutable({type: undefined}), action) {
  switch(action.type) {
    case actionTypes.SHOW_DETAILS:
      return {
        type: 'details',
        data: action.docID
      };
    case actionTypes.SHOW_PREFERENCES:
      return {
        type: 'preferences',
      };
    case actionTypes.SHOW_LOADING:
      return {
        type: 'loading',
      };
    case actionTypes.HIDE_OVERLAY:
      return {
        type: undefined,
      };
    default:
      return overlay;
  }
}