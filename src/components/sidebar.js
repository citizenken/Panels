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
  sliderWidth: null,
  view: function({state, attrs, dom}) {
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
    var width = undefined;
    if (state.sliderWidth) {
      console.log(state.sliderWidth)
      width = state.sliderWidth
    }
    return m("div.side-bar", {
      style: "width:" + width
    }, [
      m("div.bar-content", [
        m('ul', elements)
        ]),
      m("div.draggable", {onmousedown: function(e) {onMousedown(state, e)}})
    ]);
  }
}

function onMousedown(state, event) {
  var mousemoveHandler = function(event) {
    console.log(state.sliderWidth)
    var pageX = event.pageX;
    var minWidth = document.getElementsByTagName('body')[0].offsetWidth * .10;
    state.sliderWidth = Math.max(minWidth, pageX) + "px";
    m.redraw();
  }

  var mouseupHandler = function() {
    document.removeEventListener('mousemove', mousemoveHandler, false);
    document.removeEventListener('mouseup', mouseupHandler, false);
  }

  document.addEventListener('mousemove', mousemoveHandler, false);
  document.addEventListener('mouseup', mouseupHandler, false);
}

function changeDoc(docId) {
  rendererStore.dispatch(actions.changeCurrentDoc(docId))
}