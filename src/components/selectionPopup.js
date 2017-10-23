var m = require("mithril")
var Comment = require('../models/comment')


module.exports = SelectionPopup = {
  mode: undefined,
  lineHeight: undefined,
  oninit: function({state, attrs, dom}) {
    state.lineHeight = document.getElementsByClassName('CodeMirror-line')[0].offsetHeight;
    window.addEventListener('resize', function() {
      recalculateCoords(attrs)
    }, false);
  },
  view: function({state, attrs, dom}) {
    var modeContainer = undefined,
        style = {};

    if (state.mode === 'comment') {
      attrs.parentState = state;
      modeContainer = m(CommentForm, attrs);
    }
    var coords = attrs.selection.coords;
    style = {
      left: coords.left + 'px',
      top: coords.top + state.lineHeight + 'px'
    }

    return m('div#selection-popup', {
      style: style
    }, [
      m('div.btn-group', [
        m('button.btn.btn-primary', {
          type: "button",
          onclick: function(e) {
            state.mode = (state.mode === 'comment') ? undefined:'comment';
          }
        }, [
          m('span.glyphicon.glyphicon-comment')
          ]),
        m('button.btn.btn-primary', {type: "button"}),
        m('button.btn.btn-primary', {type: "button"}),
        ]),
      modeContainer
    ]);
  }
}

var CommentForm = {
  comment: undefined,
  oncreate: function({state, attrs, dom}) {
    state.comment = new Comment.Comment(undefined, attrs.user.id, attrs.doc.id, attrs.selection)
  },
  view: function({state, attrs, dom}) {
    return m('div', [
      m('div.form-group', [
        m('label', {for: "comment"}, 'Comment:'),
        m('textarea.form-control#comment', {
          rows: 5,
          onchange: function(e) {
            var content = e.target.value;
            state.comment = Comment.updateCommentContent(state.comment, content)
          }
        }),
        ]),
      m('button.btn.btn-primary', {
        type: "button",
        onclick: function() {
          Comment.saveComment(state.comment, attrs.doc)
            .then(function() {
              attrs.parentState.mode = undefined;
            })
        }
      }, 'Submit'),
      ]);
  }
}

function recalculateCoords(attrs) {
  attrs.selection.coords = attrs.cm.getCharCoords(attrs.selection.raw.ranges[0].anchor, 'page')
  m.redraw();
}