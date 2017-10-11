var path = require('path'),
    Electron = require('electron'),
    mainStore = require('./mainStore'),
    actions = require('./state/actions/actions'),
    Menu = Electron.Menu,
    template = [];
//   {
//     label: 'Edit',
//     submenu: [
//       {role: 'undo'},
//       {role: 'redo'},
//       {type: 'separator'},
//       {role: 'cut'},
//       {role: 'copy'},
//       {role: 'paste'},
//       {role: 'pasteandmatchstyle'},
//       {role: 'delete'},
//       {role: 'selectall'}
//     ]
//   },
//   {
//     label: 'View',
//     submenu: [
//       {role: 'reload'},
//       {role: 'forcereload'},
//       {role: 'toggledevtools'},
//       {type: 'separator'},
//       {role: 'resetzoom'},
//       {role: 'zoomin'},
//       {role: 'zoomout'},
//       {type: 'separator'},
//       {role: 'togglefullscreen'}
//     ]
//   },
//   {
//     role: 'window',
//     submenu: [
//       {role: 'minimize'},
//       {role: 'close'}
//     ]
//   },
//   {
//     role: 'help',
//     submenu: [
//       {
//         label: 'Learn More',
//         click () { require('electron').shell.openExternal('https://electron.atom.io') }
//       }
//     ]
//   }
// ]

if (process.platform === 'darwin') {
  template.unshift({
    label: Electron.app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {
        label: 'Preferences',
        click: showPreferences
      },
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })
}


function showPreferences(menuItem, browserWindow, event) {
  mainStore.dispatch(actions.showPreferences())
}

Menu.setApplicationMenu(Menu.buildFromTemplate(template));




