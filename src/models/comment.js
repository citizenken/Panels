var randomstring = require("randomstring");
var Immutable = require('seamless-immutable');
var firebaseService = require('electron').remote.getGlobal('firebaseService');

module.exports = {
  Comment,
  updateCommentContent,
  saveComment
}

function Comment(id, authorID, docID, selection) {
  if (!id) {
    id = randomstring.generate(20)
  }

  var anchor = selection.raw.ranges[0].anchor,
      head = selection.raw.ranges[0].head;

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
  })

  return comment;
}

function updateCommentContent(comment, content) {
  return Immutable.set(comment, 'content', content);
}

function saveComment(comment) {
  return firebaseService.saveComment(comment);
}