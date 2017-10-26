var m = require("mithril")
var CommentModel = require("../models/comment")

module.exports = {
  buildCommentElement,
  buildAddCommentElement
}

function buildCommentElement(comment) {
  return m("div.comment#" + comment.id, [
          m('div.well.well-sm', comment.content)
        ]);
}

function buildAddCommentElement(cmService, selection) {
  var el =  {
    comment: new CommentModel.Comment(undefined, cmService.currentUser, cmService.state.doc.id, selection),
    showCommentEntryForm: false,
    element: function() {
      var self = this;
      return m("div.add-comment#add-comment-box", [
                m('button.btn.btn-primary', {
                  type: "button",
                  onclick: function() {
                    var formEl = document.getElementById('add-comment-form');
                    if (!self.showCommentEntryForm) {
                      formEl.classList.add('show-block');
                      self.showCommentEntryForm = true;
                    } else {
                      formEl.classList.remove('show-block')
                      self.showCommentEntryForm = false;
                    }

                  }
                }, 'Add comment'),
                m('form#add-comment-form', [
                  m('div.form-group', [
                    m('label', {for: "comment"}, 'Comment:'),
                    m('textarea.form-control#comment', {
                      onchange: function(e) {
                        var content = this.value;
                        self.comment = CommentModel.updateCommentContent(self.comment, content)
                      }
                    }),
                  ]),
                  m('button.btn.btn-primary', {
                    type: "button",
                    onclick: function() {
                      CommentModel.saveComment(self.comment)
                        .then(function() {
                          cmService.removeCommentEntry();
                        })
                    }
                  }, 'Save')
                  ])
            ]);
    }
  }
  return el;
}