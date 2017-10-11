var m = require('mithril')
var Tabs = require('./tabs')
var Sidebar = require('./sidebar')
var Footer = require('./footer')
var Details = require('./details')
var Preferences = require('./preferences')
var rendererStore = require('../rendererStore');
var config = require('electron').remote.getGlobal('config');

var root = document.body

var stateData = rendererStore.getState();
var unsubscribe = rendererStore.subscribe(function() {
  stateData = rendererStore.getState();
  m.redraw();
});

var Main = {
  view: function() {
    var overlayEl = undefined;

    if (stateData.showDetails) {
      overlayEl = m(Details, {stateData: stateData,});
    }

    if (stateData.preferences) {
      overlayEl = m(Preferences, {stateData: stateData,});
    }

    return m(".main", [
      m(Sidebar, {stateData: stateData}),
      overlayEl,
      m(Tabs, {stateData: stateData})
      ]);
  }
}

m.mount(root, Main)