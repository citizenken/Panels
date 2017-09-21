var Redux = require('redux')
var currentDocumentReducer = require('./reducers/currentDocument');
var documentReducer = require('./reducers/documents');
var tabReducer = require('./reducers/tabs');
var sidebarReducer = require('./reducers/sidebar');
var sysConfigReducer = require('./reducers/sysConfig');
var Immutable = require('seamless-immutable');

// Initial state
var initialState = Immutable({
  currentDocument: {},
  documents: {},
  tabs: {},
  sysConfig: {},
  sidebarConfig: {}
});

var panelsApp = Redux.combineReducers({
  currentDocument: currentDocumentReducer,
  documents: documentReducer,
  tabs: tabReducer,
  sysConfig: sysConfigReducer,
  sidebarConfig: sidebarReducer
});

module.exports = {
  initialState,
  panelsApp
}