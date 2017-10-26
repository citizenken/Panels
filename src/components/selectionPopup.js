var m = require("mithril");
var Comment = require('../models/comment');
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');

module.exports = SelectionPopup = {
  mode: undefined,
  lineHeight: undefined,
  oncreate: function({state, attrs, dom}) {
    window.addEventListener('resize', function() {
      recalculateCoords(attrs)
    }, false);
  },
  onremove: function({state, attrs, dom}) {
    rendererStore.dispatch(actions.hideCommentPopup());
  },
  view: function({state, attrs, dom}) {
    console.log(attrs.selection);
    var modeContainer = undefined,
        coords = attrs.selection,
        style = {
          left: coords.left + 'px',
          top: coords.top + 'px'
        };

    if (state.mode === 'comment') {
      attrs.parentState = state;
      modeContainer = m(CommentForm, attrs);
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
    var selection = {
      anchor: attrs.cm.editor.getCursor('anchor'),
      head: attrs.cm.editor.getCursor('head')
    }

    state.comment = new Comment.Comment(undefined, attrs.user.id, attrs.doc.id, selection)
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
              rendererStore.dispatch(actions.hideCommentPopup())
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