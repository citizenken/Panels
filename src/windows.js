var electron = require('electron');
var path = require('path');
var app = require('./app');
const electronApp = electron.app;


module.exports = {
  createOpenWindow,
  createDocumentWindow
}

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createOpenWindow() {
  const win = new electron.BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    // resizable: false
  });

  var url = 'file://' + path.resolve(__dirname, '..', 'static', 'openWindow.html')

  win.loadURL(url);
  win.webContents.openDevTools()
  win.on('closed', onClosed);

  win.once('ready-to-show', function() {
    win.show();
  })

  return win;
}


function createDocumentWindow() {
  const win = new electron.BrowserWindow({
    width: 600,
    height: 400,
    show: false
  });

  var url = 'file://' + path.resolve(__dirname, '..', 'static', 'workspace.html')

  win.loadURL(url);
  win.maximize();
  win.webContents.openDevTools()
  win.on('closed', onClosed);

  win.once('ready-to-show', function() {
    win.show();
  })

  return win;
}