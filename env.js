"use strict";

var fs = require("fs"),
    util = require("util");

module.exports = function() {
    var env = null;
    var cloneObj = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    var JSEnv = function() {
        if (env === null) {
            var envStr = fs.readFileSync("/app/env.json", "utf8");
            env = JSON.parse(envStr);
        }
        this.env = env;
        return this;
    };
    JSEnv.prototype.ident = function() {
        return cloneObj(this.env.ident);
    };
    JSEnv.prototype.user = function() {
        return cloneObj(this.env.ident.user);
    };
    JSEnv.prototype.container = function() {
        return cloneObj(this.env.ident.container);
    };
    JSEnv.prototype.app = function() {
        return cloneObj(this.env.ident.app || {});
    };
    JSEnv.prototype.coreSettings = function() {
        return cloneObj(this.env.settings.core);
    };
    JSEnv.prototype.appSettings = function() {
        return cloneObj(this.env.settings.app || {});
    };
    JSEnv.prototype.find = function(path) {
        var keys = path.split(".");
        if (keys.length === 0)
            return null;
        var obj = cloneObj(this.env);
        for (var i = 0; i < keys.length; i++) {
            if (Object.keys(obj).indexOf(keys[i]) > -1) {
                obj = obj[keys[i]];
            } else {
                return null;
            }
        }
        return obj;
    };
    JSEnv.prototype.getSiteURL = function() {
        var coreSettings = this.coreSettings(),
            userDomains = coreSettings["user-domains"],
            autoDomain = coreSettings["auto-domain"];
        if (Array.isArray(userDomains) && userDomains.length > 0) {
            var preferred = userDomains[0];
            for (var i = 0; i < userDomains.length; i++) {
                if (userDomains[i]["preferred"]) {
                    preferred = userDomains[i];
                    break;
                }
            }
            if (!preferred["name"] || preferred["name"] === "")
                throw("corrupt env: preferred domain has no name");
            return util.format("%s://%s", (preferred["secure"]? "https": "http"), preferred["name"]);
        }
        if (!autoDomain || autoDomain.length === 0)
            throw("auto-domain not found in env");
        return util.format("https://%s", autoDomain);
    };
    return new JSEnv();
}();
