var m = require('mithril')
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var Document = require('../models/document');
var root = document.body;


var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  m.redraw();
});

module.exports = OpenWindow = {
  view: function({state, attrs, dom}) {
    return m('div.full-height', [
        m('div.full-height.file-picker-container', [
          m(FilePicker, {parentState: state, stateData: stateData}),
          ]),
        m('div.full-height.info-box-container', [
          m('div.info-box', 'this is the info box')
          ])
      ]);
  }
}

var FilePicker = {
  view: function({state, attrs, dom}) {
    var stateData = attrs.stateData,
        elements = [
        m('li.file-item.bold.list-header', 'Remote Files')
        ];

    for (var d in stateData.documents) {
      var doc = attrs.stateData.documents[d];
      elements.push(m('li.file-item', {

      }, doc.title));
    }

    return m('ul.file-picker', [
      elements
      ]);
  }
}

// var FileItem = {
//   view: function({state, attrs, dom}) {
//     var fileOwnership = undefined,
//         currentUser = attrs.stateData.user;

//     if (attrs.doc.author === currentUser.id) {
//       fileOwnership = 'author';
//     } else if (Object.keys(attrs.doc.collaborators).indexOf(currentUser.id) > -1) {
//       fileOwnership = 'collaborator: ' + attrs.doc.collaborators[currentUser.id];
//     }

//     return m('button.list-group-item.file-button', {
//       onclick: m.withAttr('value', changeDoc),
//       value: attrs.doc.id,
//     }, [
//     m('span.glyphicon.glyphicon-info-sign.show-details', {
//       onclick: function(e) {
//         e.stopPropagation();
//         rendererStore.dispatch(actions.showDetails(attrs.doc.id));
//       }
//     }),
//     m('span', attrs.doc.title),
//     m('br'),
//     m('span.file-ownership', fileOwnership)
//     ]);
//   }
// }

// function changeDoc(docId) {
//   Document.setAsCurrentDoc(docId);
// }

m.mount(root, OpenWindow)