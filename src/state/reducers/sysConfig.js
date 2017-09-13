var actionTypes = require('../constants/actionTypes.js')
var Immutable = require('seamless-immutable');
var configService = require('../../services/config-service.js');

module.exports = function sysConfigReducer(config = Immutable({}), action) {
  switch(action.type) {
    case actionTypes.LOAD_CONFIG:
      return Immutable(action.config);
    case actionTypes.UPDATE_CONFIG:
      var updatedConfig = Immutable.set(config, action.config.key, action.config.value);
      configService.saveConfig(updatedConfig);
      return updatedConfig;
    default:
      return config;
  }
}