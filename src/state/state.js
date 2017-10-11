var Redux = require('redux')
var currentDocumentReducer = require('./reducers/currentDocument');
var documentReducer = require('./reducers/documents');
var cursorsReducer = require('./reducers/cursors');
var tabReducer = require('./reducers/tabs');
var overlayReducer = require('./reducers/overlay');
var sidebarReducer = require('./reducers/sidebar');
var sysConfigReducer = require('./reducers/sysConfig');
var Immutable = require('seamless-immutable');

// Initial state
var initialState = Immutable({
  currentDocument: '',
  documents: {},
  tabs: {},
  sysConfig: {},
  sidebarConfig: {},
  cursors: {},
  overlay: {}
});

var panelsApp = Redux.combineReducers({
  currentDocument: currentDocumentReducer,
  documents: documentReducer,
  tabs: tabReducer,
  sysConfig: sysConfigReducer,
  sidebarConfig: sidebarReducer,
  cursors: cursorsReducer,
  overlay: overlayReducer
});

module.exports = {
  initialState,
  panelsApp
}