var m = require("mithril");
var path = require('path');
var actions = require('../state/actions/actions');
var rendererStore = require('../rendererStore');
var firebaseService = require('electron').remote.getGlobal('firebaseService');
var appPath = path.resolve(__dirname, '..', 'app.js');
var app = require('electron').remote.require(appPath);

module.exports = Preferences = {
  view: function({state, attrs, dom}) {
    var settings = attrs.stateData.sysConfig,
        user = firebaseService.firebaseUser;

    return  m('div.container.section-container', [
        m('div.row', [
          m('.col-md-3'),
          m('.col-md-8', [
            m('.list-group.detail-list', [
                m('.list-group-item', [
                  m('h4.list-group-item-heading', 'User'),
                  m('p', user.username)
                  ]),
                m('.list-group-item', [
                  m('h4.list-group-item-heading', 'Settings'),
                  m('p', '')
                  ]),
                m('.list-group-item', [
                  m('button.btn.btn-warning', {
                    onclick: function(e) {
                      app.logOutUser();
                    }
                  }, 'Log out'),
                ])
              ]),
            ]),
          m('div.col-md-1', [
            m('span.glyphicon.glyphicon-remove', {
                role: 'button',
                onclick: function() {
                  rendererStore.dispatch(actions.hideOverlay());
                }
              })
            ]),
        ])
      ]);
  }
}