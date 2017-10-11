var m = require("mithril");
var path = require('path');
var firebasePath = path.resolve(__dirname, '..', 'services', 'firebase-service.js');
var firebaseService = require('electron').remote.require(firebasePath);

module.exports = Preferences = {
  view: function({state, attrs, dom}) {
    var settings = attrs.stateData.sysConfig,
        user = firebaseService.firebaseUser;

    return m('div.overlay', [
      m('div.container', [
        m('div.user'),
        m('div.system-settings')
        ])
      ]);
  }
}