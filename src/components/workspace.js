var m = require('mithril')
var Sidebar = require('./sidebar')
var Header = require('./header')
var Tabs = require('./tabs')
var root = document.body

var Workspace = {
  view: function() {
    return m("main", [
      m(Tabs),
    ])
  }
}

m.mount(root, Workspace)