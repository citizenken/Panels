var Redux = require('redux')
var currentDocumentReducer = require('./reducers/currentDocument');
var documentReducer = require('./reducers/documents');
var cursorsReducer = require('./reducers/cursors');
var tabReducer = require('./reducers/tabs');
var overlayReducer = require('./reducers/overlay');
var sidebarReducer = require('./reducers/sidebar');
var userReducer = require('./reducers/user');
var sysConfigReducer = require('./reducers/sysConfig');
var Immutable = require('seamless-immutable');
var actionTypes = require('./constants/actionTypes.js')

// Initial state
var initialState = Immutable({
  currentDocument: '',
  documents: {},
  tabs: {},
  sysConfig: {},
  sidebarConfig: {},
  cursors: {},
  overlay: {},
  user: {}
});

var panelsApp = Redux.combineReducers({
  currentDocument: currentDocumentReducer,
  documents: documentReducer,
  tabs: tabReducer,
  sysConfig: sysConfigReducer,
  sidebarConfig: sidebarReducer,
  cursors: cursorsReducer,
  overlay: overlayReducer,
  user: userReducer
});

var reducer = function (state, action) {
  if (action.type === actionTypes.USER_LOGOUT) {
    state = initialState
  }

  return panelsApp(state, action)
}

module.exports = {
  initialState,
  reducer
}