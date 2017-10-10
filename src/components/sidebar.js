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
        elements.push(m(FileItem, {doc: doc}));
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
        m('div.list-group', elements)
        ]),
      m("div.draggable", {onmousedown: function(e) {onMousedown(state, e)}})
    ]);
  }
}

var FileItem = {
  view: function({state, attrs, dom}) {
    return m('button.list-group-item.file-button', {
      onclick: m.withAttr('value', changeDoc),
      value: attrs.doc.id
    }, [
    m('span.glyphicon.glyphicon-info-sign.show-details', {
      onclick: function(e) {
        e.stopPropagation();
        rendererStore.dispatch(actions.showDetails(attrs.doc.id));
      }
    })
    ], attrs.doc.title);
  }
}

function changeDoc(docId) {
  Document.setAsCurrentDoc(docId);
}



function onMousedown(state, event) {
  var minWidth = 3;
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