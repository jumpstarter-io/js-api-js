"use strict";
var Crypto = require("crypto"),
    Util = require("util");

var ntohl = function (b, i) {
    return ((0xff & b[i]) << 24) |
            ((0xff & b[i + 1]) << 16) |
            ((0xff & b[i + 2]) << 8) |
            ((0xff & b[i + 3]));
};

var hexStrToIntBuffer = function (hexStr) {
    var buf = new Buffer(hexStr.length / 2),
        bOff = 0,
        i = 0;
    for (i = 0; i < hexStr.length; i += 2) {
        buf.writeUInt8(parseInt(hexStr.substring(i, i + 2), 16), bOff++);
    }
    return buf;
};

var hexStrToBinaryStr = function(hexStr) {
    var out = "";
    for (var i = 0; i < hexStr.length; i += 2) {
        out += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
    }
    return out;
};

var parseToken = function (token) {
    if (token.length !== 144 || !/^[0-9a-fA-F]+$/.test(token)) {
        throw("Invalid Auth Token");
    }
    return {
        eTime: token.substring(0, 16),
        y: token.substring(16, 16 + 64),
        h: token.substring(16 + 64)
    };
};

var verifyToken = function (tokenObj, x) {
    var now = new Date(),
        tokenExpiry = ntohl(hexStrToIntBuffer(tokenObj.eTime.substring(8)), 0);
    if ((new Date(tokenExpiry * 1000)) < now)
        return false;
    var eRaw = hexStrToBinaryStr(tokenObj.eTime),
        yRaw = hexStrToBinaryStr(tokenObj.y),
        xRaw = hexStrToBinaryStr(x),
        shasum = Crypto.createHash("sha256");
    shasum.update(Util.format("%s%s%s", eRaw, yRaw, xRaw));
    return shasum.digest("hex") === tokenObj.h;
};

exports.validateSession = function (env, tokenString) {
    var sessionKey = env.container().session_key,
        tokenObj = parseToken(tokenString);
    if (!tokenObj || !sessionKey) {
        throw("Invalid Auth Token");
    }
    return verifyToken(tokenObj, sessionKey);
};
