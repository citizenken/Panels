var m = require('mithril')
var Sidebar = require('./sidebar')
var Immutable = require('seamless-immutable');
var Document = require('../models/document');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var CMService = require('../services/codemirror-service')
var url = require('url');
var querystring = require('querystring');
var queryParams = querystring.parse(url.parse(window.location.href).query);
var root = document.body;

var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  m.redraw();
});

module.exports = Workspace = {
  view: function() {
    return m('div', [
      m(Page, {stateData: stateData}),
      m('div#cursor_mount', {style: 'display:none'})
      ]);
  }
}

module.exports = Page = {
  doc: null,
  cm: null,
  cursors: {},
  oncreate: function ({state, attrs, dom}) {
    var storeState = rendererStore.getState(),
        docId = queryParams.docId,
        docTitle = queryParams.docTitle
        loadDoc = null;

    if (Object.keys(storeState.documents).indexOf(docId) > -1) {
      doc = Immutable(storeState.documents[docId]);
      state.doc = doc;
      loadDoc = true;
    } else {
      doc = new Document.Document(docId, docTitle, 'vanlenteComicbook');
      rendererStore.dispatch(actions.addDoc(doc));
    }
    state.doc = doc;
    state.CMService = new CMService.CMService(dom, state);

    if (loadDoc) {
      state.CMService.setValue(doc.content);
    }

    state.CMService.focus();
    state.CMService.registerEvents(state);
  },
  onupdate: function({state, attrs, dom}) {
    if (state.doc) {
      var stateData = Immutable(attrs.stateData),
          documents = stateData.documents,
          stateDoc = documents[state.doc.id],
          localDoc = state.doc;
          localRemoteDiff = Document.getRemoteFileDiff(localDoc, stateDoc);
      if (localRemoteDiff.length > 0) {
        state.doc = stateDoc;
        if (localRemoteDiff.indexOf('content') > -1) {
          state.CMService.setValue(stateDoc.content);
        }
      }
    }

    if (stateData.cursors[stateDoc.id].collabCursors) {
      state.CMService.setCollabCursors(stateData.cursors[stateDoc.id].collabCursors);
    }
  },
  view: function() {
    return m(".page");
  }
}

m.mount(root, Workspace)