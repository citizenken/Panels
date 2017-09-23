var CodeMirror = require('codemirror');
var Document = require('../models/document');
var m = require('mithril');


module.exports = {
  CMService
}

var cmOptions = {
    lineWrapping : true,
    lineNumbers: false,
    singleCursorHeightPerLine: false,
    autofocus: true,
    pollInterval: 100
};

function CMService(dom, state) {
  var instance = {
    editor: CodeMirror(dom, cmOptions),
    state: state,
    focus: function() {
      var self = this;
      self.editor.focus();
    },
    setValue: function(value) {
      var self = this;
      self.editor.setValue(value);
      self.editor.refresh();
    },
    registerEvents: function() {
      var self = this;
      // self.editor.on('cursorActivity', self.updateCursorLocation.bind(self));
      // self.editor.on('blur', self.handleBlur.bind(self));
      self.editor.on('focus', self.handleFocus.bind(self));
      self.editor.on('changes', self.handleChanges.bind(self));
      // self.editor.on('renderLine', self.handleRenderLine.bind(self));
      // self.editor.on('update', self.handleUpdate.bind(self));
      self.editor.on('cursorActivity', self.handleCursorActivity.bind(self));
    },
    handleChanges: function (c, change) {
      var state = this.state;
      if (c.getValue() !== state.doc.content) {
        state.doc = Document.updateOnCMChange(state.doc, c, change);
        Document.emitChanges(state.doc);
      }
    },
    handleFocus: function (c, change) {
      var state = this.state;
      Document.upateCursorLocation(c);
      if (rendererStore.getState().currentDocument.id !== state.doc.id) {
        Document.setAsCurrentDoc(state.doc.id, c);
      }
    },
    handleCursorActivity: function(c) {
      Document.upateCursorLocation(c);
    },
    setCollabCursors: function(cursors) {
      var self = this,
          cm = self.editor,
          state = self.state,
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
  }

  return instance;
}