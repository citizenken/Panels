var m = require('mithril')
var Tabs = require('./tabs')
var Sidebar = require('./sidebar')
var Footer = require('./footer')
var Details = require('./details')
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
    var detailsEl = undefined;
    if (stateData.showDetails) {
      detailsEl = m(Details, {stateData: stateData,});
    }


    return m(".main", [
      m(Sidebar, {stateData: stateData}),
      detailsEl,
      m(Tabs, {stateData: stateData})
      ]);
  }
}

m.mount(root, Main)