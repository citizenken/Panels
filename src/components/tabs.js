var m = require("mithril");
var path = require('path');
var querystring = require('querystring');
var randomstring = require("randomstring");
var TabGroup = require("electron-tabs");
var dragula = require("dragula");
var rendererStore = require('../rendererStore');
var actions = require('../state/actions/actions');
var Immutable = require('seamless-immutable');

window.addEventListener('resize', m.redraw, false);

module.exports = Tabs = {
  tabGroup: null,
  tabs: {},
  oncreate: function({state, attrs, dom}) {
    var stateData = attrs.stateData;
    state.tabGroup = new TabGroup({
      newTab: function() {
        return addTab(state);
      },
      ready: function (tabGroup) {
        dragula([tabGroup.tabContainer], {
          direction: "horizontal"
        });
      }
    });
    console.log('this is attrs', attrs);

    openLastDoc(state, stateData)
    registerTabGroupEvents(state);
  },
 onupdate: function({state, attrs, dom}) {
    var activeTab = state.tabGroup.getActiveTab(),
        activeTabId = undefined,
        currentDoc = attrs.stateData.currentDocument,
        tabs = state.tabs;

    if (activeTab) {
      activeTabId = activeTab.id
    }

    if (currentDoc) {
      if (Object.keys(tabs).indexOf(currentDoc) == -1){
        addTab(state, currentDoc, attrs.stateData.documents[currentDoc]);
      }
    }

    if (activeTabId !== tabs[currentDoc]) {
      state.tabGroup.getTab(tabs[currentDoc]).activate();
    }

    updateTabTitles(state, attrs.stateData);
  },
  view: function({state, attrs, dom}) {
    var width = undefined;
    if (attrs.stateData.sidebarConfig.width) {
      var sidebarWidth = attrs.stateData.sidebarConfig.width,
          width = document.getElementsByTagName('body')[0].offsetWidth - sidebarWidth + 'px';
    }
    return m("div.workspace-container", {
      style: "width:" + width
    },[
      m(".etabs-tabgroup", [
        m(".etabs-tabs"),
        m(".etabs-buttons"),
      ]),
      m(".etabs-views")
    ])
  }
}

function addTab(state, docId, loadedDoc) {
  var tabGroup = state.tabGroup,
      docTitle = 'Untitled';

  if (!docId){
    var docId = randomstring.generate(20);
  }

  if (loadedDoc) {
    docTitle = loadedDoc.title
  }

  var queryParams = querystring.stringify({docId: docId, docTitle: docTitle}),
      url = 'file://' + path.resolve(__dirname, '..', '..', 'static', 'workspace.html');
      url = url + '?' + queryParams;
      tabConfig = {
          visible: true,
          active: true,
          src: url,
          webviewAttributes: {
            nodeintegration: true
          },
          title: docTitle
      };

  state.tabs[docId] = tabGroup.newTabId;

  if (loadedDoc) {
    tabGroup.addTab(tabConfig);
  } else {
    return tabConfig;
  }
}

function openLastDoc(state, stateData) {
  var currentDoc = stateData.currentDocument;
  if (currentDoc) {
    if (Object.keys(stateData.documents).indexOf(currentDoc) > -1 &&
        Object.keys(state.tabs).indexOf(currentDoc) == -1) {
      addTab(state, currentDoc, stateData.documents[currentDoc]);
    } else if (Object.keys(stateData.documents).indexOf(currentDoc) == -1) {
      rendererStore.dispatch(actions.changeCurrentDoc(''));
    }
  }
}

function updateTabTitles(state, stateData) {
  for (var docTabId in state.tabs) {
    var docTab = state.tabs[docTabId],
        tab = state.tabGroup.getTab(docTab);

    if (tab) {
      tabTitle = tab.getTitle(),
      doc = stateData.documents[docTabId];
      if (doc && tabTitle !== doc.title) {
        tab.setTitle(doc.title);
      }
    }
  }
}

function registerTabGroupEvents(state) {
  state.tabGroup.on("tab-added", function(tab, tabGroup) {
    setTimeout(function() {tab.tab.classList.remove('just-added')}, 500);
    tab.webview.addEventListener('dom-ready', function(e) {
      var x = window.scrollX, y = window.scrollY;
      tab.webview.focus();
      tab.webview.openDevTools();
    });
  });

  state.tabGroup.on("tab-removed", function(tab, tabGroup) {
    var closedDocument = null,
        newActiveTab = tabGroup.getActiveTab(),
        newActiveDocID = '';
    for (var docTab in state.tabs) {
      if (state.tabs[docTab] === tab.id) {
        closedDocument = docTab;
        delete state.tabs[docTab];
      } else if (state.tabs[docTab] === newActiveTab.id) {
        newActiveDocID = docTab;
      }
    }

    if (rendererStore.getState().currentDocument === closedDocument) {
      rendererStore.dispatch(actions.changeCurrentDoc(newActiveDocID));
    }
  });
}