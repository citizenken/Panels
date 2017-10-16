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
  removeCollabCursor,
  showDetails,
  showPreferences,
  hideOverlay,
  showLoading,
  userLogout
}

function userLogout() {
  return {
    type: actionTypes.USER_LOGOUT,
  }
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

function userCursorUpdate(cursor, docID) {
  return {
    type: actionTypes.USER_CURSOR_UPDATE,
    cursor: cursor,
    docID: docID
  }
}

function collabCursorUpdate(collabID, cursor, docID) {
  return {
    type: actionTypes.COLLAB_USER_CURSOR_UPDATE,
    collabID: collabID,
    cursor: cursor,
    docID: docID
  }
}

function removeCollabCursor(collabID, docID) {
  return {
    type: actionTypes.REMOVE_COLLAB_USER_CURSOR,
    collabID: collabID,
    docID: docID
  }
}

function showDetails(docID) {
  return {
    type: actionTypes.SHOW_DETAILS,
    docID: docID
  }
}

function showPreferences() {
  return {
    type: actionTypes.SHOW_PREFERENCES,
  }
}

function showLoading() {
  return {
    type: actionTypes.SHOW_LOADING,
  }
}

function hideOverlay() {
  return {
    type: actionTypes.HIDE_OVERLAY,
  }
}