var Redux = require('redux')
var currentDocumentReducer = require('./reducers/currentDocument');
var documentReducer = require('./reducers/documents');
var tabReducer = require('./reducers/tabs');
var sysConfigReducer = require('./reducers/sysConfig');
var Immutable = require('seamless-immutable');

// Initial state
var initialState = Immutable({
  currentDocument: '',
  documents: {},
  tabs: {},
  sysConfig: {}
});

var panelsApp = Redux.combineReducers({
  currentDocument: currentDocumentReducer,
  documents: documentReducer,
  tabs: tabReducer,
  sysConfig: sysConfigReducer
});

module.exports = {
  initialState,
  panelsApp
}