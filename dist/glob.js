var bashGlob = require("bash-glob");
var bashPath = require("bash-path");
module.exports = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!bashPath) {
        throw new TypeError("`bash` must be installed"); // TODO move this check to bash-glob
    }
    return bashGlob.sync.apply(bashGlob, args);
};
