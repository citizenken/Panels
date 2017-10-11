var m = require("mithril");
var path = require('path');
var actions = require('../state/actions/actions');
var firebasePath = path.resolve(__dirname, '..', 'services', 'firebase-service.js');
var firebaseService = require('electron').remote.require(firebasePath);

module.exports = Preferences = {
  view: function({state, attrs, dom}) {
    var settings = attrs.stateData.sysConfig,
        user = firebaseService.firebaseUser,
        display = 'height:0%';

    if (attrs.stateData.overlay.type) {
      display = 'height:100%';
    }

    return  m('div.container.section-container', [
        m('div.row', [
          m('.col-md-3'),
          m('.col-md-8', [
            m('div.user'),
            m('div.system-settings')
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