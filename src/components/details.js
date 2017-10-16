var m = require("mithril");
var GeneralDetails = require('./generalDetails');
var Collaborators = require('./Collaborators');
var firebaseService = require('electron').remote.getGlobal('firebaseService');
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');

module.exports = Details = {
  doc: undefined,
  sections: {
    'General': GeneralDetails,
    'Collaborators': Collaborators,
    'History': undefined
  },
  selectedSection: 'General',
  docDetails: undefined,
  oninit: function ({state, attrs, dom}) {
    var doc = attrs.stateData.documents[attrs.stateData.overlay.data],
        promises = [];

    state.docDetails = {};

    promises.push(firebaseService.getUser(doc.author)
      .then(function(user) {
        state.docDetails.author = user;
      }));
    if (doc.collaborators && Object.keys(doc.collaborators).length > 0) {
      promises.push(firebaseService.getCollaborators(doc)
        .then(function(collaborators) {
          state.docDetails.collaborators = collaborators;
        }));
    }

    Promise.all(promises)
      .then(function() {
        m.redraw();
      });
  },
  onupdate: function({state, attrs, dom}) {
    var doc = attrs.stateData.documents[attrs.stateData.overlay.data];
    if (doc.collaborators && Object.keys(doc.collaborators).length > 0) {
      firebaseService.getCollaborators(doc)
      .then(function(collaborators) {
        state.docDetails.collaborators = collaborators;
        m.redraw();
      });
    }
  },
  view: function({state, attrs, dom}) {
    return generateDetails(state, attrs.stateData);
  }
}

function generateDetails(state, stateData) {
  var menuElements = [],
      section = undefined;

  if (state.selectedSection) {
    section = generateSelectedSection(state, stateData);
  }

  for (var s in state.sections) {
    menuElements.push(
      m('button.list-group-item.file-button', {
        onclick: m.withAttr('value', function (section) {
          state.selectedSection = section;
        }),
        value: s,
      }, s)
      );
  }

  return  m('div.container.section-container', [
      m('div.row', [
        m('div.col-md-3', [
          m('div.list-group', menuElements)
          ]),
        m('div.col-md-8', section),
        m('div.col-md-1', [
          m('span.glyphicon.glyphicon-remove', {
              role: 'button',
              onclick: function() {
                rendererStore.dispatch(actions.hideOverlay());
              }
            })
          ]),
        ]),
      ]);
}

function generateSelectedSection(state, stateData) {
  return m(state.sections[state.selectedSection], {
        docDetails: state.docDetails,
        stateData: stateData
      })
}