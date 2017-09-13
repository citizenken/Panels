var m = require('mithril')
var Sidebar = require('./sidebar')
var CodeMirror = require('codemirror')
// var CodeMirrorAddon = require('codemirror/addon/display/fullscreen')
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

module.exports = Workspace = {
  oncreate: function ({state, attrs, dom}) {
    var storeState = rendererStore.getState(),
        docId = queryParams.docId,
        docTitle = queryParams.docTitle;
    state.cm = CodeMirror(dom, cmOptions);

    if (Object.keys(storeState.documents).indexOf(docId) > -1) {
      doc = storeState.documents[docId];
      state.cm.setValue(doc.content);
      state.cm.refresh()
    } else {
      doc = new Document.Document(docId, docTitle, 'comicbook')
      rendererStore.dispatch(actions.addDoc(doc));
    }

    state.doc = doc;
    state.cm.focus();
    registerCodeMirrorEvents(state);
  },
  view: function() {
    return m(".page");
  }
}

function registerCodeMirrorEvents(state) {
  debugger
  state.cm.on('changes', function (c, change) {
    if (c.getValue() !== state.doc.content) {
      state.doc = Document.updateOnCMChange(state.doc, c, change);
    }
  });

  state.cm.on('focus', function (c, change) {
    if (rendererStore.getState().currentDocument !== state.doc.id) {
      rendererStore.dispatch(actions.changeCurrentDoc(state.doc.id));
    }
  });
}

m.mount(root, Workspace)