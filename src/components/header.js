var m = require("mithril")
var root = document.body

module.exports = Header = {
  view: function() {
    return m("header",[
      m("h1", {class: "title"}, "My header app"),
      m("button", "A button"),
    ])
  }
}