var m = require('mithril')
var electron = require('electron');
var firebaseService = electron.remote.getGlobal('firebaseService');
var windowManager = electron.remote.getGlobal('windowManager');
var currentWindow = electron.remote.getCurrentWindow();
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var Document = require('../models/document');
var GeneralDetails = require('./generalDetails');
var u = require('../services/utility');
var root = document.body;


var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  m.redraw();
});


module.exports = OpenWindow = {
  selectedDoc: undefined,
  docDetails: {},
  onupdate: function({state, attrs, dom}) {
    if (state.selectedDoc && Object.keys(state.docDetails).indexOf(state.selectedDoc) === -1) {
      var doc = stateData.documents[state.selectedDoc]
      firebaseService.getUser(doc.author)
        .then(function(user) {
          state.docDetails[state.selectedDoc] = {
            author: user
          };
          m.redraw();
        });
    }
  },
  view: function({state, attrs, dom}) {
    var details = undefined;

    if (state.selectedDoc) {
      details = m(FileDetails, {
        parentState: state,
        stateData: stateData,
        docDetails: state.docDetails
      })
    }
    return m('div.full-height', [
      m('div.file-container', [
        m('div.full-height.file-picker-container', [
          m(FilePicker, {parentState: state, stateData: stateData}),
          m('div.filepicker-buttons.btn-group.btn-group-sm', [
            m('button.btn.btn-default', {
              onclick: function() {
                changeDoc({title: 'Untitled'});
              }
            }, '+'),
            m('button.btn.btn-default', {
              disabled: ((state.selectedDoc) ? false: true),
              onclick: function() {
                var doc = stateData.documents[state.selectedDoc];
                Document.deleteDoc(doc);
                state.selectedDoc = undefined
              }
            }, '-')
            ]),
          ]),
        m('div.full-height.info-box-container', [
          m('div.info-box', [
            details
            ])
          ]),
        ]),
        m('div.open-window-buttons', [
          m('button.btn.btn-primary.open-file-button', {
            disabled: ((state.selectedDoc) ? false: true),
            onclick: function() {
              var doc = stateData.documents[state.selectedDoc];
              changeDoc(doc);
            }
          }, 'Open file'),
          m('button.btn.btn-warning.open-file-button', {
            onclick: function() {
              currentWindow.close();
            }
          }, 'Cancel'),
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
      var doc = attrs.stateData.documents[d],
          style = {};
      if (attrs.parentState.selectedDoc === doc.id) {
        style.background = 'lightblue';
      }

      elements.push(m('li.file-item', {
        style: style,
        docID: doc.id,
        onclick: m.withAttr("docID", function (val) {
          attrs.parentState.selectedDoc = val;
          })
      }, doc.title));
    }

    return m('ul.file-picker', [
      elements
      ]);
  }
}

var FileDetails = {
  onupdate: function({state, attrs, dom}) {
    console.log(attrs.docDetails.author)
  },
  view: function({state, attrs, dom}) {
    var stateData = attrs.stateData,
        docId = attrs.parentState.selectedDoc,
        doc = stateData.documents[docId],
        authorName = undefined;

    if (!doc) {
      return
    }

    if (Object.keys(attrs.docDetails).indexOf(docId) > -1) {
      var author = attrs.docDetails[docId].author;
      authorName = m('p', author.displayName + ' (' + author.username + ')')
    }


    return m('div', [
      m('div', [
        m('h4.list-group-item-heading', doc.title),
        m('section', [
          m('h5.list-group-item-heading', 'Script Type'),
          m('p', doc.type),
          ]),
        m('section', [
          m('h5.list-group-item-heading', 'Created On'),
          m('p', u.timestampToLocaletime(doc.createdOn)),
          ]),
        m('section', [
          m('h5.list-group-item-heading', 'Last Modified'),
          m('p', u.timestampToLocaletime(doc.modifiedOn)),
          ]),
        m('section', [
          m('h5.list-group-item-heading', 'Author'),
          authorName
          ])
      ])
    ]);
  }
}

function changeDoc(doc) {
  windowManager.openDocument(doc);
  currentWindow.close();
}

m.mount(root, OpenWindow)