var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var firebaseService = require('electron').remote.getGlobal('firebaseService');

module.exports = {
  Comment,
  updateCommentContent,
  saveComment,
  deleteComment,
  undeleteComment
}

function Comment(id, authorID, docID, selection) {
  if (!id) {
    id = randomstring.generate(20)
  }

  var anchor = selection.anchor,
      head = selection.head;

  var comment = Immutable({
    id: id,
    author: authorID,
    selection: {
      anchor: anchor,
      head: head
    },
    content: null,
    doc: docID,
    createdOn: Date.now(),
    modifiedOn: Date.now(),
    deleted: false
  })

  return comment;
}

function updateCommentContent(comment, content) {
  return Immutable.set(comment, 'content', content);
}

function saveComment(comment) {
  return firebaseService.saveComment(comment);
}

function deleteComment(comment) {
  var comment = Immutable.set(comment, 'deleted', true);
  return firebaseService.updateComment(comment);
}

function undeleteComment(comment) {
  var comment = Immutable.set(comment, 'deleted', false);
  return firebaseService.updateComment(comment);
}
