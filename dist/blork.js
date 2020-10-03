var _a = require("fs"), existsSync = _a.existsSync, lstatSync = _a.lstatSync;
var _b = require("blork"), checker = _b.checker, check = _b.check, add = _b.add, ValueError = _b.ValueError;
var Writable = require("stream").Writable;
var WritableStreamBuffer = require("stream-buffers").WritableStreamBuffer;
// Get some checkers.
var isAbsolute = checker("absolute");
// Add a directory checker.
add("directory", function (v) { return isAbsolute(v) && existsSync(v) && lstatSync(v).isDirectory(); }, "directory that exists in the filesystem");
// Add a writable stream checker.
add("stream", 
// istanbul ignore next (not important)
function (v) { return v instanceof Writable || v instanceof WritableStreamBuffer; }, "instance of stream.Writable or WritableStreamBuffer");
// Exports.
module.exports = { checker: checker, check: check, ValueError: ValueError };
