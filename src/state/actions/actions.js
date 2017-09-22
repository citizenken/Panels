var actionTypes = require('../constants/actionTypes.js')
var immutable = require('immutable');

module.exports = {
  addDoc,
  updateDoc,
  changeCurrentDoc,
  openDoc,
  updateConfig,
  loadConfig,
  loadDoc,
  resizeSidebar,
  userCursorUpdate,
  collabCursorUpdate,
  removeCollabCursor
}


function addDoc(doc) {
  return {
    type: actionTypes.ADD_DOCUMENT,
    document: doc
  }
}

function updateDoc(doc) {
  return {
    type: actionTypes.UPDATE_DOCUMENT,
    document: doc
  }
}

function changeCurrentDoc(docId) {
  return {
    type: actionTypes.CHANGE_CURRENT_DOCUMENT,
    docId: docId
  }
}

function openDoc(tab) {
  return {
    type: actionTypes.OPEN_DOCUMENT,
    tab: tab
  }
}

function loadDoc(doc) {
  return {
    type: actionTypes.LOAD_DOC,
    document: doc
  }
}

function loadConfig(config) {
  return {
    type: actionTypes.LOAD_CONFIG,
    config: config
  }
}

function updateConfig(configUpdate) {
  return {
    type: actionTypes.UPDATE_CONFIG,
    config: {
      key: configUpdate.key,
      value: configUpdate.value
    }
  }
}

function resizeSidebar(newWidth) {
  return {
    type: actionTypes.RESIZE_SIDEBAR,
    width: newWidth
  }
}

function userCursorUpdate(cursor) {
  return {
    type: actionTypes.USER_CURSOR_UPDATE,
    cursor: cursor
  }
}

function collabCursorUpdate(collabID, cursor) {
  return {
    type: actionTypes.COLLAB_USER_CURSOR_UPDATE,
    collabID: collabID,
    cursor: cursor
  }
}

function removeCollabCursor(collabID) {
  return {
    type: actionTypes.REMOVE_COLLAB_USER_CURSOR,
    collabID: collabID
  }
}