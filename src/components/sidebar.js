var m = require("mithril")
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');
var Document = require('../models/document')


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
    if (state.sliderWidth || attrs.stateData.sidebarConfig.width) {
      width = state.sliderWidth || (attrs.stateData.sidebarConfig.width + "px");
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
  var minWidth = 10;
  var mousemoveHandler = function(event) {
    var pageX = event.pageX,
        newSliderWidth = Math.max(minWidth, pageX);
    state.sliderWidth = newSliderWidth + "px";
    rendererStore.dispatch(actions.resizeSidebar(newSliderWidth));
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
  Document.setAsCurrentDoc(docId);
}