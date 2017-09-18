var Redux = require('redux')
var RES = require('redux-electron-store');
var state = require('./state/state')

var enhancer = Redux.compose(
    RES.electronEnhancer({
    // Allows synched actions to pass through all enhancers
    dispatchProxy: a => rendererStore.dispatch(a),
  })
)

module.exports = rendererStore = Redux.createStore(state.panelsApp, state.initialState, enhancer)

// let unsubscribe = rendererStore.subscribe(function () {
//   console.log(rendererStore.getState())
// });
