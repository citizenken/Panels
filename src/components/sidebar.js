var m = require("mithril")
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');


//   value : rendererStore.getState()
// }
// var stateS
// var unsub = rendererStore.subscribe(function() {
//   App.value = rendererStore.getState();
//   m.redraw();
// });

module.exports = Sidebar = {
  view: function({attrs}) {
    var elements = [];
    if (attrs.stateData) {

      for (var prop in attrs.stateData.documents) {
        var doc = attrs.stateData.documents[prop];
        elements.push(m('li', [
          m('button', {
            onclick: m.withAttr('value', changeDoc),
            value: doc.id
          }, doc.title)
          ])
        );
      }
    }
    return m("div", {style: "float:left;width:50%;"}, [
      m("ul", elements)
    ]);
  }
}

function changeDoc(docId) {
  rendererStore.dispatch(actions.changeCurrentDoc(docId))
}