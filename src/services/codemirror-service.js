require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/mode/simple.js');
var m = require('mithril');
var CodeMirror = require('codemirror');
var Document = require('../models/document');
var Comment = require('../components/comment');
var customModes = require('../custom-codemirror-modes');
var deepEqual = require('deep-equal');
var utilities = require('./utility');
var randomstring = require("randomstring");

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

function CMService(dom, state, currentUser, readOnly) {
  cmOptions.mode = state.doc.type;
  cmOptions.readOnly = readOnly;

  var instance = {
    editor: CodeMirror(dom, cmOptions),
    state: state,
    currentUser: currentUser,
    longestCharacerTag: null,
    logCharTagChange: null,
    comments: {},
    commentMarks: {},
    cursors: {},
    commentEntry: undefined,
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
      self.editor.on('focus', self.handleFocus.bind(self));
      self.editor.on('beforeChange', self.handleBeforeChange.bind(self));
      self.editor.on('changes', self.handleChanges.bind(self));
      self.editor.on('renderLine', self.handleRenderLine.bind(self));
      self.editor.on('update', self.handleUpdate.bind(self));
      self.editor.on('cursorActivity', self.handleCursorActivity.bind(self));
      self.editor.on('beforeSelectionChange', self.handleSelection.bind(self));
    },
    handleBeforeChange: function(c, change) {
      var self = this,
          token = c.getTokenAt(change.from),
          allTokens = c.getMode().allTokens();
      if (token.type && change.origin === '+input') {
        var token = token.type.replace(/.*-/, '');
        if (!change.text[0].match(allTokens[token].regex)) {
          change.update(change.from, change.to, change.text[0].toUpperCase());
        }
      }

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
      Document.upateCursorLocation(c, state.doc.id);
    },
    handleSelection: function(c, selection) {
      var self = this,
          coords = {},
          anchor = selection.ranges[0].anchor,
          head = selection.ranges[0].head;

      if (!deepEqual(anchor, head)) {
        if (self.commentEntry) {
          self.commentEntry.clear();
          self.commentEntry = undefined;
        }

        var mount = document.getElementById('add-comment-mount'),
            div = document.createElement("div");

        mount.append(div);
        m.render(div, Comment.buildAddCommentElement(self, {anchor: anchor, head: head}).element());
        addCommentBox = document.getElementById('add-comment-box');
        self.commentEntry = self.editor.addLineWidget(head.line, addCommentBox, {insertAt:0});
      } else {
        self.removeCommentEntry()
        state.selection = undefined;
      }
    },
    removeCommentEntry: function() {
      var self = this;
      if (self.commentEntry) {
        self.commentEntry.clear();
      }
    },
    getCharCoords: function(char, reference) {
      var self = this;
      return self.editor.charCoords({line: char.line, ch: char.ch}, reference)
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
          m.render(document.getElementById('cursor-mount'), cursorEl);
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
    },
    setComments: function(comments) {
      var self = this;

      // if (Object.keys(self.commentMarks).length > 0
      //   && Object.keys(self.comments).length > 0) {
      //   for (var c in self.commentMarks) {
      //     self.commentMarks[c].clear();
      //     self.comments[c].clear();
      //   }
      // }

      for (var c in comments) {
        var comment = comments[c];
        if (Object.keys(self.comments).indexOf(comment.id) === -1) {
          var mount = document.getElementById('comment-mount'),
              div = document.createElement("div");

          div.id = 'comment-mount' + comment.id;
          mount.appendChild(div);
          m.render(div, Comment.buildCommentElement(comment, comments, self, self.editor));

          let commentNode = document.getElementById(comment.id);
          self.commentMarks[comment.id] = self.editor.markText(comment.selection.anchor,
                comment.selection.head, {
                  css: 'background-color: yellow',
                  title: comment.id,
                  clearOnEnter: false
                });

          let markElement = document.querySelector('[title="' + comment.id + '"]');

          markElement.addEventListener('mouseenter', function(e) {
            commentNode.style.display = 'block';
          });

          markElement.addEventListener('mouseleave', function(e) {
            commentNode.style.display = 'none';
          });


          self.comments[comment.id] = self.editor.addLineWidget(comment.selection.anchor.line, commentNode);
        }
      }
    },
    setMarkHandlers: function (mark) {

    }
  }

  return instance;
}