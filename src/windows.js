var electron = require('electron');
var path = require('path');
var app = require('./app');
var querystring = require('querystring');
const electronApp = electron.app;


module.exports = {
  initWindowManager,
  createOpenWindow,
  createDocumentWindow
}

function initWindowManager() {
  var wm = {
    windows: {},
    currentWindow: undefined,
    setCurrentWindow: function(winID) {
      var self = this;
      self.currentWindow = winID;
    },
    onClose: function(winID) {
      var self = this;
      self.windows[winID] = null;
      if (self.currentWindow === winID) {
        self.currentWindow = undefined;
      }
      delete self.windows[winID];
    },
    addWindow: function(win, winID) {
      var self = this;
      self.windows[winID] = win;
      win.on('closed', function(e) {
        self.onClose(winID)
      });

      win.on('focus', function() {
        self.setCurrentWindow(winID);
      })
    },
    openDocument: function(doc) {
      var self = this;
      if (Object.keys(self.windows).indexOf(doc.id) === -1) {
        self.createDocumentWindow(doc);
      }
    },
    createDocumentWindow: function(doc) {
      var self = this,
          docWindow = createDocumentWindow(doc);
      self.addWindow(docWindow, doc.id);

    }
  };
  return wm
}


function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createOpenWindow() {
  const win = new electron.BrowserWindow({
    width: 800,
    height: 500,
    show: false,
    title: 'Open File',
    resizable: false,
  });

  var url = 'file://' + path.resolve(__dirname, '..', 'static', 'openWindow.html')

  win.loadURL(url);
  win.webContents.openDevTools()

  win.once('ready-to-show', function() {
    win.show();
  })

  return win;
}


function createDocumentWindow(doc) {
  const win = new electron.BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    title: doc.title
  });

  var queryParams = querystring.stringify({docId: doc.id, docTitle: doc.title}),
      url = 'file://' + path.resolve(__dirname, '..', 'static', 'workspace.html');
      url = url + '?' + queryParams;

  win.loadURL(url);
  win.maximize();
  win.webContents.openDevTools()

  win.once('ready-to-show', function() {
    win.show();
  })

  // win.on('focus', function(e) {
  //   console.log(doc.title + 'is focused')
  // })

  return win;
}