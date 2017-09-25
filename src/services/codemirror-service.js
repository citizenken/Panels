require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/mode/simple.js');
var CodeMirror = require('codemirror');
var Document = require('../models/document');
var m = require('mithril');
var customModes = require('../custom-codemirror-modes');

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

for (var mo in customModes) {
  var mode = customModes[mo];
  CodeMirror.defineSimpleMode(mode.meta.name, mode);
}

function CMService(dom, state) {
  cmOptions.mode = state.doc.type;
  var instance = {
    editor: CodeMirror(dom, cmOptions),
    state: state,
    longestCharacerTag: null,
    logCharTagChange: null,
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
      self.editor.on('renderLine', self.handleRenderLine.bind(self));
      self.editor.on('update', self.handleUpdate.bind(self));
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
      Document.upateCursorLocation(c, state.doc.id);
      if (rendererStore.getState().currentDocument !== state.doc.id) {
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
    },
    handleUpdate: function (instance) {
      var self = this;
      if (self.logCharTagChange) {
        self.logCharTagChange = null;
        instance.refresh();
      }
    },
    handleRenderLine: function (instance, line, element) {
      var self = this, characters = [], longestCharacterTag = null;

      CodeMirror.runMode(instance.getValue(), self.state.doc.type, function (text, style) {
        if (style === 'vlc-character') {
          if (text.length > longestCharacterTag) {
            longestCharacterTag = text.length;
          }
        }
      });

      // Iterate over the styles for each line, and apply wrapper classes for all found tokens
      // angular.forEach(line.styles, function (style) {
      for (var s in line.styles) {
        var style = line.styles[s];
        if (typeof style === 'string' && style.indexOf('-wrapper') === -1) {
          var lineInfo = self.editor.lineInfo(line);
          var currentTokens = self.editor.getLineTokens(lineInfo.line);

          for (var ct in currentTokens) {
            var token = currentTokens[ct];
            element.className += ' cm-' + token.type + '-wrapper';
            if (token.type === 'vlc-character') {
              var characterTagLength = token.string.length;
              if (longestCharacterTag !== self.longestCharacerTag) {
                self.longestCharacerTag = longestCharacterTag
                self.logCharTagChange = true;
              }

              var dialoguePadding = longestCharacterTag - characterTagLength,
              dialogueEl = element.getElementsByClassName("cm-vlc-dialogue")[0];
              if (dialogueEl) {
                dialogueEl.style.paddingLeft = dialoguePadding + '.1ch';
              }
            }
          }
        }
      }
    }
  }

  return instance;
}