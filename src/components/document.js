var m = require('mithril')
var Sidebar = require('./sidebar')
var root = document.body

module.exports = Document = {
  view: function() {
    return m("main", [
      m(Sidebar),
    ])
  }
}

console.log(root)

m.mount(root, Document)