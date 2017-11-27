var HueApi = require("node-hue-api").HueApi;
var Config = require("./hue.cfg");
var _ = require('lodash');
var fs = require('fs');
var csvWriter = require('csv-write-stream');
var moment = require('moment');

var host = Config.ip;

var connected = new Promise(function(resolve, reject) {
  if(!_.isUndefined(Config.userId)) {
    return resolve(Config.userId);
  }
  else {
    var saveUserName = function(result) {
      Config.userId = "'" + JSON.stringify(result) + "'";
    }

    var displayError = function(err) {
        console.log(err);
    };

    var hue = new HueApi();

    // --------------------------
    // Using a promise
    hue.registerUser(host, userDescription)
    .then(saveUsername)
    .fail(displayError)
    .done()
    .then(function() {
      resolve(Config.userId);
    });
  }
});

connected.then(function(userId) {

  var writer = csvWriter()
  writer.pipe(fs.createWriteStream('out.csv', {flags: 'a'}));

  var logResult = function(result) {
    var state = _.reduce(result.lights, function(lights, light) {
      lights[light.name] = light.state.reachable;
      return lights;
    }, {timestamp: moment().format('LLLL')});
    console.log(state);
    writer.write(state);
  };

  api = new HueApi(host, userId);

  setInterval(function() {
    // Using a promise
    api.lights()
    .then(logResult)
    .done();
  }, 6000);
});
