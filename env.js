"use strict";

var auth = require("./auth"),
    fs = require("fs");

var appEnv = false;
var appSettings = false;

var loadJSONSync = function(path) {
	console.log(path);
    var buf = fs.readFileSync(path, "utf8");
    console.log(buf);
    var obj = JSON.parse(buf);
    console.log(obj);
    return obj
}

var parseSettings = function(obj) { 
    var appSettings =  {}
    try {
        appSettings = obj.settings[obj.ident.app.id];
    } catch(e) {}
    var settings = obj.settings.assembly;
    // Overwrite settings with the more specific appsettings.
    for (var key in appSettings) {
        settings[key] = appSettings[key];
    }
    return settings;
}

var parseAppEnv = function(alt_env_json) {
	var envObj;
    try {
        envObj = loadJSONSync("/app/env.json");
    } catch (e) {}
    if (!envObj) {
        try {
            envObj = loadJSONSync(alt_env_json);
        } catch (e) {}
    }
    if (!envObj) {
        throw("no valid env.json available");
    }
    return envObj;
}; 

var init = function(alt_env_json) {
	appEnv = parseAppEnv(alt_env_json);
	appSettings = parseSettings(appEnv);
}

if (!module.parent) {
    (function() {
	var testValues = getTestValues();
	console.log(exports.JSTokenAuth(testValues.tokenString, testValues.sessionSecret));
    })();
}

var env = function() {
	if (appEnv) {
		return appEnv;
	} else {
		throw ("jumpstarter not initalized");
	}
}

var settings = function() {
	if  (appSettings) {
		return appSettings;
	} else {
		throw ("jumpstarter not initalized");
	}
}

module.exports.init = init;
module.exports.env = env;
module.exports.settings = settings;
