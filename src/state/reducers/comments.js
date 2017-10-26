var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');

module.exports = function commentsReducer(comments = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.COMMENT_UPDATE:
      return Immutable.setIn(comments, [action.docID, action.comment.id], action.comment);
    case actionTypes.COMMENT_REMOVE:
      return Immutable.setIn(comments, [action.docID], Immutable.without(comments[action.docID], action.comment.id));
    default:
      return comments;
  }
}