var m = require('mithril')
var Sidebar = require('./sidebar')
var CodeMirror = require('codemirror')
var Immutable = require('seamless-immutable');
var Document = require('../models/document');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var url = require('url');
var querystring = require('querystring');
var queryParams = querystring.parse(url.parse(window.location.href).query);
var root = document.body;

var cmOptions = {
    lineWrapping : true,
    lineNumbers: false,
    singleCursorHeightPerLine: false,
    autofocus: true,
    pollInterval: 100
};

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
        docTitle = queryParams.docTitle;
    state.cm = CodeMirror(dom, cmOptions);
    console.log(storeState.documents);
    if (Object.keys(storeState.documents).indexOf(docId) > -1) {
      doc = Immutable(storeState.documents[docId]);
      setCodeMirrorValue(state, doc);
    } else {
      doc = new Document.Document(docId, docTitle, 'comicbook')
      rendererStore.dispatch(actions.addDoc(doc));
    }

    state.doc = doc;
    state.cm.focus();
    registerCodeMirrorEvents(state);
  },
  onupdate: function({state, attrs, dom}) {
    if (state.doc) {
      var stateData = Immutable(attrs.stateData),
          documents = stateData.documents,
          stateDoc = documents[state.doc.id],
          localDoc = state.doc;
      if (Document.hasRemoteContentUpdated(localDoc, stateDoc)) {
        setCodeMirrorValue(state, stateDoc);
      }
    }
    setCollabCursors(state, stateData.currentDocument.collabCursors);
  },
  view: function() {
    return m(".page");
  }
}

function setCodeMirrorValue(state, doc) {
  state.doc = doc;
  state.cm.setValue(doc.content);
  state.cm.refresh();
}

function registerCodeMirrorEvents(state) {
  state.cm.on('changes', function (c, change) {
    if (c.getValue() !== state.doc.content) {
      state.doc = Document.updateOnCMChange(state.doc, c, change);
      Document.emitChanges(state.doc);
    }
  });

  state.cm.on('focus', function (c, change) {
    Document.upateCursorLocation(c);
    if (rendererStore.getState().currentDocument.id !== state.doc.id) {
      Document.setAsCurrentDoc(state.doc.id, c);
    }
  });

  state.cm.on('cursorActivity', function (c) {
    Document.upateCursorLocation(c);
  });
}

function setCollabCursors(state, cursors) {
  var cm = state.cm,
      updatedCursorKeys = Object.keys(cursors),
      stateCursorKeys = Object.keys(state.cursors),
      allMarks = cm.getAllMarks();

  // clear all existing marks
  for (var i in allMarks) {
    allMarks[i].clear();
  }

  // clear out a user's cursor element if it isn't in the stateData anymore
  for (var key in stateCursorKeys) {
    var collabId = stateCursorKeys[key];
    if (updatedCursorKeys.indexOf(collabId) === -1) {
      delete state.cursors[collabId]
    }
  }

  for (var cursor in cursors) {
    var cursorData = cursors[cursor];
    if (!state.cursors[cursor]) {
      var cursorColor = 'blue',
          cursorEl = m('div.collab-cursor#' + cursor, [
            m('div.cursor', {style: 'border-color:' + cursorColor})
            ]);
      m.render(document.getElementById('cursor_mount'), cursorEl);
      state.cursors[cursor] = document.getElementById(cursor).cloneNode(true);
    }
    cm.setBookmark(cursorData, {widget: state.cursors[cursor]})
  }
}


m.mount(root, Workspace)