var m = require("mithril");
var u = require('../services/utility');

module.exports = GeneralDetails = {
  editTitle: undefined,
  view: function({state, attrs, dom}) {
    var titleElement = 'h2',
        doc = attrs.stateData.documents[attrs.stateData.overlay.data],
        authorName = undefined;

    if (state.editTitle) {
      titleElement = m('.input-group.edit-title', [
        m('input.form-control', {
          type: 'text',
          value: doc.title
        })])
    } else {
      titleElement = m('h2', {
        onclick: function() {
          state.editTitle = true;
        }
      }, doc.title);
    }

    if (attrs.docDetails.author) {
      authorName = m('p', attrs.docDetails.author.displayName + ' (' + attrs.docDetails.author.username + ')')
    }

    return m("div", [
      titleElement,
      m('.list-group.detail-list', [
        m('.list-group-item', [
          m('h4.list-group-item-heading', 'Script Type'),
          m('p', doc.type)
          ]),
        m('.list-group-item', [
          m('h4.list-group-item-heading', 'Created On'),
          m('p', u.timestampToLocaletime(doc.createdOn))
          ]),
        m('.list-group-item', [
          m('h4.list-group-item-heading', 'Last Modified'),
          m('p', u.timestampToLocaletime(doc.modifiedOn))
          ]),
        m('.list-group-item', [
          m('h4.list-group-item-heading', 'Author'),
          authorName
          ])
        ])
      ]);
  }
}