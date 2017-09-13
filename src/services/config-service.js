var fs = require('fs'),
    path = require('path'),
    Immutable = require('seamless-immutable');

module.exports = {
  loadConfig,
  saveConfig
}

var initialConfig = {
  oauthRoot: 'https://panels-auth.kenpetti.us/',
  configPath: null,
  allowInternet: true,
  refreshToken: null
}

function loadConfig(configPath) {
  var configFile = path.join(configPath, 'configuration.json');
  try {
    return Immutable(JSON.parse(fs.readFileSync(configFile, 'utf8')));
  } catch (e) {
    createConfig(configFile)
    return loadConfig(configPath);
  }
}

function createConfig(configPath) {
  try{
    fs.mkdirSync(path.dirname(configPath))
  } catch (e){
  } finally {
    initialConfig['configPath'] = configPath
    fs.writeFileSync(configPath, JSON.stringify(initialConfig));
  }
}

function saveConfig(config) {
  fs.writeFileSync(config['configPath'], JSON.stringify(config), 'utf8');
}