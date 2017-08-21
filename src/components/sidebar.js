var m = require("mithril")

module.exports = Sidebar = {
  view: function() {
    return m("sidebar", [
      m("h1", {class: "title"}, "My first app"),
      m("button", "A button"),
    ])
  }
}