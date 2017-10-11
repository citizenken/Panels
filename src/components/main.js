var m = require('mithril')
var Tabs = require('./tabs')
var Sidebar = require('./sidebar')
var Footer = require('./footer')
var Details = require('./details')
var Preferences = require('./preferences')
var Loading = require('./loading')
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
    var overlayEl = undefined,
        overlayCSS = {
          height: '0%'
        };

    if (stateData.overlay.type) {
      overlayCSS.height = '100%';
    }

    if (stateData.overlay.type === 'preferences') {
      overlayEl = m(Preferences, {stateData: stateData});
    } else if (stateData.overlay.type === 'loading') {
      overlayCSS.transition = 'none';
      overlayCSS['background-color'] = '#bb2f2b';
      overlayEl = m(Loading, {stateData: stateData});
    } else if (stateData.overlay.type === 'details') {
      overlayEl = m(Details, {stateData: stateData});
    }

    return m(".main", [
      m(Sidebar, {stateData: stateData}),
      m('div.overlay', {style: overlayCSS}, [
        overlayEl
        ]),
      m(Tabs, {stateData: stateData})
      ])
  }
}

m.mount(root, Main)