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

var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  // console.log(stateData);
  m.redraw();
});

module.exports = Workspace = {
  doc: null,
  oncreate: function ({state, attrs, dom}) {
    debugger
    var storeState = rendererStore.getState(),
        docId = queryParams.docId,
        docTitle = queryParams.docTitle;
    state.cm = CodeMirror(dom, cmOptions);
    console.log(storeState.documents);
    if (Object.keys(storeState.documents).indexOf(docId) > -1) {
      doc = storeState.documents[docId];
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
      var documents = attrs.stateData.documents,
          stateDoc = documents[state.doc.id],
          localDoc = state.doc;
      if (Document.hasRemoteContentUpdated(localDoc, stateDoc)) {
        setCodeMirrorValue(state, stateDoc);
      }
    }
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
    if (rendererStore.getState().currentDocument !== state.doc.id) {
      rendererStore.dispatch(actions.changeCurrentDoc(state.doc.id));
    }
  });
}

m.mount(root, {view: function () {return m(Workspace, {stateData: stateData})}})