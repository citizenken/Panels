var actionTypes = require('../constants/actionTypes.js')
var immutable = require('immutable');

module.exports = {
  addDoc,
  updateDoc,
  changeCurrentDoc,
  openDoc,
  updateConfig,
  loadConfig,
  loadDocs,
  resizeSidebar
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

function loadDocs(documents) {
  return {
    type: actionTypes.LOAD_DOCS,
    documents: documents
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