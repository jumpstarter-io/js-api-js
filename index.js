var env = require("./env"),
	auth = require("./auth");

var validateSession = function(tokenString) {
	if (env.env()) {
		return auth.JSTokenAuth(tokenString, env.env().ident.instance.sess);
	} else {
		throw ("jumpstarter not initalized");
	}

};


module.exports.init = env.init;
module.exports.env = env.env;
module.exports.settings = env.settings;
module.exports.validateSession = env.validateSession;
