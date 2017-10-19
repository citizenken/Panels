var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function userReducer(user = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.USER_LOGIN:
      console.log('user_login')
      return Immutable(action.user);
    case actionTypes.USER_LOGOUT:
      return Immutable({});
    default:
      return user;
  }
}