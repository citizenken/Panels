'use strict';
const electron = require('electron');
var path = require('path');
var mainStore = require('./mainStore');
var actions = require('./state/actions/actions');
var configService = require('./services/config-service.js');
var onlineService = require('./services/online-service.js')
const app = electron.app;

var config = configService.loadConfig(app.getPath('userData'));
mainStore.dispatch(actions.loadConfig(config))

global.config = config;

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

  onlineService.nodeCheckInternet()
  .then(function() {
    if (config.allowInternet) {
      var firebaseService = require('./services/firebase-service.js');
      global.firebaseService = firebaseService;
      firebaseService.signIn()
      .then(function (user) {
        return firebaseService.loadUserFiles(user);
      })
      .then(function(files) {
        mainStore.dispatch(actions.hideOverlay());
      });
    }
  })
  .catch(function(error) {
    console.log('this is an error', error)
    console.info('No internet access, not loading firebase')
  });

  win.once('ready-to-show', function() {
    mainStore.dispatch(actions.showLoading());
    win.show();
  })

  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  var menu = require('./menu')
  mainWindow = createMainWindow();
});
