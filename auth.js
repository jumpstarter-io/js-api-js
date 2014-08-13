"use strict";
var Crypto = require("crypto"),
    Util = require("util");

var getTestValues = function () {
    return {
	tokenString: "0000000053e8d466936d3f9478f731b5315d2a93ff36994ca99a517134e10835cecf710eab58965c80e82a9402cbaba14f2b63ddc6f7601384d110f420df0ae8f828dcd366ebf931",
	sessionSecret: "c1b3447173eeee38a75c489a81d3e1a935cd26e1507c9a9015f131d9c80fba13"
    };
};

var ntohl = function (b, i) {
    return ((0xff & b[i]) << 24) |
	   ((0xff & b[i + 1]) << 16) |
	   ((0xff & b[i + 2]) << 8) |
	   ((0xff & b[i + 3]));
};

var hexStrToIntBuffer = function (hexStr) {
    var buf = new Buffer(hexStr.length / 2),
        off = 0,
        bOff = 0,
        i = 0;
    for (i = 0; i < hexStr.length; i += 2) {
		buf.writeUInt8(parseInt(hexStr.substring(i, i + 2), 16), bOff++);
    }
    return buf;
};

var parseToken = function (token) {
    if (token.length != 144 || !/^[0-9a-fA-F]+$/.test(token)) {
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
        tokenExpiry = ntohl(hexStrToIntBuffer(tokenObj.eTime), 0);
    if ((new Date(tokenExpiry)) > now) {
	var eRaw = hexStrToIntBuffer(tokenObj.eTime).toString("binary"),
	    yRaw = hexStrToIntBuffer(tokenObj.y).toString("binary"),
	    xRaw = hexStrToIntBuffer(x).toString("binary"),
	    shasum = Crypto.createHash("sha256");
	shasum.update(Util.format("%s%s%s", eRaw, yRaw, xRaw));
	return shasum.digest("hex") === tokenObj.h;
    }
    return false;
};

exports.JSTokenAuth = function (tokenString, sessionSecret) {
    var tokenObj = parseToken(tokenString);
    if (tokenObj !== null && sessionSecret) {
		return verifyToken(tokenObj, sessionSecret);
    } else {
		throw("Invalid Auth Token");
    }
};

