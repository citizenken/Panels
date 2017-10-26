var m = require('mithril')
var SelectionPopup = require('./selectionPopup')
var Immutable = require('seamless-immutable');
var Document = require('../models/document');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var CMService = require('../services/codemirror-service');
var User = require('../models/user');
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
  view: function({state, attrs, dom}) {
    return m('div', [
      m(Page, {stateData: stateData}),
      m('div#cursor-mount', {style: 'display:none'}),
      m('div#comment-mount', {style: 'display:none'}),
      m('div#add-comment-mount', {style: 'display:none'}),
      ]);
  }
}

module.exports = Page = {
  doc: null,
  cm: null,
  cursors: {},
  isSelection: false,
  oncreate: function ({state, attrs, dom}) {
    var storeState = rendererStore.getState(),
        docId = queryParams.docId,
        docTitle = queryParams.docTitle
        loadDoc = null,
        user = attrs.stateData.user
        cmReadOnly = false;

    if (Object.keys(storeState.documents).indexOf(docId) > -1) {
      doc = Immutable(storeState.documents[docId]);
      state.doc = doc;
      loadDoc = true;
    } else {
      doc = new Document.Document(docId, docTitle, 'vanlenteComicbook');
      rendererStore.dispatch(actions.addDoc(doc));
    }
    state.doc = doc;

    if (User.checkCollaboratorAccess(doc, user.id) === 'view') {
      cmReadOnly = 'nocursor';
    }

    state.CMService = new CMService.CMService(dom, state, user, cmReadOnly);

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

    if (stateData.cursors[stateDoc.id] && stateData.cursors[stateDoc.id].collabCursors) {
      state.CMService.setCollabCursors(stateData.cursors[stateDoc.id].collabCursors);
    }

    if (stateData.comments[stateDoc.id]) {
      state.CMService.setComments(stateData.comments[stateDoc.id]);
    }
  },
  view: function({state, attrs, dom}) {
    var selectionPopup = undefined;
        selectionEl = document.getElementsByClassName('CodeMirror-selected')[0];

    if (Object.keys(attrs.stateData.commentPopup).length > 0 && selectionEl) {
      selectionPopup = m(SelectionPopup, {
        doc: state.doc,
        selection: state.selection,
        user: attrs.stateData.user,
        cm: state.CMService
      });
    }

    if (!state.isSelection
      && Object.keys(attrs.stateData.commentPopup).length > 0
      && selectionEl) {
      rendererStore.dispatch(actions.hideCommentPopup());
    }

    return m(".page", [
        selectionPopup,
      ]);
  }
}

m.mount(root, Workspace)