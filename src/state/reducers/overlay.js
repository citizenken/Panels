var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function overlayReducer(overlay = Immutable({type: undefined}), action) {
  switch(action.type) {
    case actionTypes.SHOW_DETAILS:
      console.log('show_details')
      return {
        type: 'details',
        data: action.docID
      };
    case actionTypes.SHOW_PREFERENCES:
      console.log('show_pref')
      return {
        type: 'preferences',
      };
    case actionTypes.SHOW_LOADING:
      console.log('show_loading')
      return {
        type: 'loading',
      };
    case actionTypes.HIDE_OVERLAY:
      console.log('hide_overlay')
      return {
        type: undefined,
      };
    default:
      return overlay;
  }
}