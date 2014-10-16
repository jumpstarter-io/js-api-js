var env = require("./env"),
    auth = require("./auth");

module.exports.env = env;
module.exports.validateSession = function(tokenString) {
    return auth.validateSession(env, tokenString);
};
