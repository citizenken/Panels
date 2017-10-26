var m = require('mithril');
var ElectronContextMenu = require('electron-context-menu');
var MenuItem = require('electron').remote.MenuItem;
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');

module.exports = {
  createDefaultContextMenu,
  createWorkspaceContextMenu
}

function createDefaultContextMenu() {
  return ElectronContextMenu();
}

function createWorkspaceContextMenu(webview) {
  return ElectronContextMenu({
    window: webview,
    // append: workspaceMenuItems
  });
}


function workspaceMenuItems(params, win) {
  return [
    addCommentMenuItem(params, win)
  ]
}

function addCommentMenuItem(params, win, event) {
  var enabled = true
  if (!params.selectionText) {
    enabled = false;
  }

  console.log(document.getElementsByClassName('CodeMirror-selected')[0]);

  return new MenuItem({
    label: 'Add Comment',
    click: function(menuItem, browserWindow, event, anotherParam) {
      console.log(menuItem, browserWindow, event, anotherParam)
      addCommentClicked({left: params.x, top: params.y})
    },
    enabled: enabled
  });
}

function addCommentClicked(position) {
  rendererStore.dispatch(actions.showCommentPopup(position))
}