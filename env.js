"use strict";

var fs = require("fs");

module.exports = function() {
    var cloneObj = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    var JSEnv = function() {
        var envStr = fs.readFileSync("/app/env.json", "utf8");
        this.env = JSON.parse(envStr);
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
    return new JSEnv();
}();
