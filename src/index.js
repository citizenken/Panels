'use strict';
const electron = require('electron');
var path = require('path');
var mainStore = require('./mainStore');
var actions = require('./state/actions/actions');
var app = require('./app');
const electronApp = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new electron.BrowserWindow({
    width: 600,
    height: 400,
    show: false
  });

  var url = 'file://' + path.resolve(__dirname, '..', 'static', 'main.html')

  win.loadURL(url);
  win.maximize();
  win.webContents.openDevTools()
  win.on('closed', onClosed);

  win.once('ready-to-show', function() {
    win.show();
  })

  return win;
}

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});

electronApp.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

electronApp.on('ready', () => {
  var menu = require('./menu');
  app.initialize(app.loadConfig());
  mainWindow = createMainWindow();
});
