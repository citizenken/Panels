var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function showDetailsReducer(showDetails = Immutable(''), action) {
  switch(action.type) {
    case actionTypes.SHOW_DETAILS:
      console.log('show_details')
      return action.docID;
    case actionTypes.HIDE_DETAILS:
      console.log('hide_details')
      return '';
    default:
      return showDetails;
  }
}