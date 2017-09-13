var Redux = require('redux')
var thunk = require('redux-thunk').default;
var RES = require('redux-electron-store');
var state = require('./state/state')

var enhancer = Redux.compose(
    Redux.applyMiddleware(thunk),
    RES.electronEnhancer({
    // Allows synched actions to pass through all enhancers
    dispatchProxy: a => mainStore.dispatch(a),
  })
)

module.exports = mainStore = Redux.createStore(state.panelsApp, state.initialState, enhancer)

let unsubscribe = mainStore.subscribe(function () {
  console.log(mainStore.getState())
});
