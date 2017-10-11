var m = require("mithril");

module.exports = Loading = {
  view: function({state, attrs, dom}) {
    return  m('div.loading', [
      m('div.loader'),
      m('h3', 'Loading, please wait')
      ]);
  }
}