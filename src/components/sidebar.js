var m = require("mithril")
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');
var Document = require('../models/document');


module.exports = Sidebar = {
  sliderWidth: null,
  view: function({state, attrs, dom}) {
    var elements = [];
    if (attrs.stateData) {

      for (var prop in attrs.stateData.documents) {
        var doc = attrs.stateData.documents[prop];
        elements.push(m(FileItem, {stateData: attrs.stateData, doc: doc}));
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
      m("div.draggable", {
        onmousedown: function(e) {
          dragSidebar(state, e)
        }
      })
    ]);
  }
}

var FileItem = {
  view: function({state, attrs, dom}) {
    var fileOwnership = undefined,
        currentUser = attrs.stateData.user;

    if (attrs.doc.author === currentUser.id) {
      fileOwnership = 'author';
    } else if (Object.keys(attrs.doc.collaborators).indexOf(currentUser.id) > -1) {
      fileOwnership = 'collaborator: ' + attrs.doc.collaborators[currentUser.id];
    }

    return m('button.list-group-item.file-button', {
      onclick: m.withAttr('value', changeDoc),
      value: attrs.doc.id,
    }, [
    m('span.glyphicon.glyphicon-info-sign.show-details', {
      onclick: function(e) {
        e.stopPropagation();
        rendererStore.dispatch(actions.showDetails(attrs.doc.id));
      }
    }),
    m('span', attrs.doc.title),
    m('br'),
    m('span.file-ownership', fileOwnership)
    ]);
  }
}

function changeDoc(docId) {
  Document.setAsCurrentDoc(docId);
}



function dragSidebar(state, event) {
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