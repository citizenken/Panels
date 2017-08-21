var m = require("mithril")
var path = require('path')
// var Document = require('./document')
const TabGroup = require("electron-tabs");

module.exports = Tabs = {
  tabGroup: null,
  oncreate: function(vnode) {
    console.log("Initialized")
    this.tabGroup = new TabGroup({newTab: addTab});
    this.tabGroup.on("tab-added", function(tab, tabGroup) {
      tab.webview.addEventListener('did-start-loading', function(e) {
        e.target.openDevTools()
      });
      tab.webview.addEventListener('did-stop-loading', function(e) {
        e.target.style.backgroundColor = null;
        // e.target.innerText = 'loading...';
      });
    });
  },
  view: function() {
    var self = this;
    return m("div", [
      m(".etabs-tabgroup", [
        m(".etabs-tabs"),
        m(".etabs-buttons"),
      ]),
      m(".etabs-views")
    ])
  }
}


function addTab(tab) {
  var url = 'file://' + path.resolve(__dirname, '..', '..', 'static', 'document.html')
  console.log(url)
  var tabConfig = {
      visible: true,
      active: true,
      src: url,
      webviewAttributes: {
        nodeintegration: true
      }
  };

  // console.log(m.mount(tab.webview, Document));
  // tab.on("webview-ready", function(tab) {
  //   tab.webview.loadURL(url);
  // });


  return tabConfig;
}