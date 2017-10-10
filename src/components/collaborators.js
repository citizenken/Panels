var m = require("mithril");
var u = require('../services/utility');
var Choices = require('choices.js');
var path = require('path');
var firebasePath = path.resolve(__dirname, '..', 'services', 'firebase-service.js');
var firebaseService = require('electron').remote.require(firebasePath);

var collaboratorRoles = [
'view',
'edit',
'suggest'
]

module.exports = Collaborators = {
  selectedCollaborators: {},
  choices: undefined,
  collabSearchResults: [],
  selectedRole: collaboratorRoles[0],
  changeCollabRole: {},
  oncreate: function({state, attrs, dom}) {
    initializeChoicesSelect(state, attrs, dom)
  },
  onupdate: function({state, attrs, dom}) {
    setSearchHandler(state, attrs);
  },
  view: function({state, attrs, dom}) {
    var collabRows = undefined,
        doc = attrs.stateData.documents[attrs.stateData.showDetails];
        collaborators = attrs.docDetails.collaborators;

    var crElements = [];
    for (var cr in collaboratorRoles) {
      crElements.push(
        m('option', collaboratorRoles[cr])
        );
    }

    if (collaborators) {
      collabRows = createCollaboratorRows(state, attrs, doc, crElements);
    }

    return m('div', [
      m('h3', 'Add Collaborators'),
      m('select', {
        multiple: true
      }),
      m('select', {
        onchange: function(e) {
          var role = e.target.value;
          state.selectedRole = role;
        }
      }, crElements),
      m('button.btn.btn-primary', {
        disabled: (Object.keys(state.selectedCollaborators).length > 0)? false:true,
        onclick: function(e) {
          onSaveCollaborators(e, state, doc);
        }
      }, 'Save'),
      m('h3', 'Current Collaborators'),
      m('table.table', [
        m('thead', [
          m('tr', [
            m('th', 'User'),
            m('th', 'Role')
            ]),
          ]),
        m('tbody', collabRows)
        ]),
      ]);
  }
}

var UpdateRoleButton = {
  view: function({state, attrs, dom}) {
    return m('button.btn.btn-primary', attrs, 'update role')
  }
}

function initializeChoicesSelect(state, attrs, dom) {
    var collabChoices = [];

    state.choices = new Choices(dom.getElementsByTagName('select')[0], {
      choices: collabChoices,
      removeItemButton: true,
      placeholderValue: 'Enter names',
      placeholder: true,
      noChoicesText: 'No results found'
    });

    setSearchHandler(state, attrs)

    state.choices.passedElement.addEventListener('addItem', function(event) {
      state.selectedCollaborators[event.detail.value] = event.detail;
      state.choices.hideDropdown()
    }, false);

    state.choices.passedElement.addEventListener('removeItem', function(event) {
      delete state.selectedCollaborators[event.detail.value];
    }, false);
}

function setSearchHandler(state, attrs) {
  state.choices.passedElement.addEventListener('search', function(event) {
    handleFirebaseCollabSearch(event, state, attrs)
  }, false);
}

function createCollaboratorRows(state, attrs, doc, crElements) {
  var collabRows = [],
      collaborators = attrs.docDetails.collaborators,
      author = attrs.docDetails.author

  for (var c in collaborators) {
    var collab = collaborators[c],
        updateRoleButton = null;

    if (state.changeCollabRole[collab.id]
      && state.changeCollabRole[collab.id] !== doc.collaborators[collab.id]) {
      updateRoleButton = m(UpdateRoleButton, {
        style: "visibility:visible;",
        value: state.changeCollabRole[collab.id],
        onclick: function(e) {
          console.log('update user role here');
        }
      });
    } else {
      updateRoleButton = m(UpdateRoleButton, {
        style: "visibility:hidden;"
      });
    }

    var row = m('tr', [
      m('td', collab.displayName + ' (' + collab.username + ')'),
      m('td', [
        m('select#' + collab.id, {
          onchange: function(e) {
            state.changeCollabRole[e.target.id] = e.target.value;
          }
        }, crElements),
        updateRoleButton
        ], )
      ])
    collabRows.push(row);
  }

  collabRows.unshift(
    m('tr', [
      m('td', author.displayName + ' (' + author.username + ')'),
      m('td', 'Author'),
      ])
    )

  return collabRows;
}

function onSaveCollaborators(e, state, doc) {
  var collabChoices = state.choices.getValue(true);
  firebaseService.addCollaborators(collabChoices, state.selectedRole, doc.id)
    .then(function() {
      state.choices.removeActiveItems();
      state.selectedCollaborators = {};
    })
}

function handleFirebaseCollabSearch(event, state, attrs) {
  var collaborators = attrs.docDetails.collaborators,
      doc = attrs.stateData.documents[attrs.stateData.showDetails];

  firebaseService.searchForCollab(event.detail.value, function(snapshot) {
    var user = snapshot.val(),
        results = [],
        re = new RegExp(event.detail.value, "g");

    state.collabSearchResults[user.id] = user;
    for (var u in state.collabSearchResults) {
      var user = state.collabSearchResults[u];
      if (re.test(user.username)) {
        var disabled = undefined;
        if (Object.keys(collaborators).indexOf(user.id) > -1
          || Object.keys(state.selectedCollaborators).indexOf(user.id) > -1
          || user.id === doc.author) {
          disabled = true;
        }
        results.push({
          value: user.id,
          label: user.username,
          disabled: disabled
        });
      } else {
        delete state.collabSearchResults[u];
      }
    }
    state.choices.setChoices(results, 'value', 'label', true);
  });
}





