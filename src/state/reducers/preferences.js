var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function preferencesReducer(showPreferences = false, action) {
  switch(action.type) {
    case actionTypes.SHOW_PREFERENCES:
      console.log('show_pref')
      return true;
    case actionTypes.HIDE_PREFERENCES:
      console.log('hide_pref')
      return false;
    default:
      return showPreferences;
  }
}