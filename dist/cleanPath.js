var _a = require("path"), normalize = _a.normalize, isAbsolute = _a.isAbsolute, join = _a.join;
var check = require("./blork").check;
/**
 * Normalize and make a path absolute, optionally using a custom CWD.
 * Trims any trailing slashes from the path.
 *
 * @param {string} path The path to normalize and make absolute.
 * @param {string} cwd=process.cwd() The CWD to prepend to the path to make it absolute.
 * @returns {string} The absolute and normalized path.
 *
 * @internal
 */
function cleanPath(path, cwd) {
    if (cwd === void 0) { cwd = process.cwd(); }
    // Checks.
    check(path, "path: path");
    check(cwd, "cwd: absolute");
    // Normalize, absolutify, and trim trailing slashes from the path.
    return normalize(isAbsolute(path) ? path : join(cwd, path)).replace(/[/\\]+$/, "");
}
// Exports.
module.exports = cleanPath;
