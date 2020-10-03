var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Writable = require("stream").Writable;
var check = require("./blork").check;
/**
 * Create a stream that passes messages through while rewriting scope.
 * Replaces `[semantic-release]` with a custom scope (e.g. `[my-awesome-package]`) so output makes more sense.
 *
 * @param {stream.Writable} stream The actual stream to write messages to.
 * @param {string} scope The string scope for the stream (instances of the text `[semantic-release]` are replaced in the stream).
 * @returns {stream.Writable} Object that's compatible with stream.Writable (implements a `write()` property).
 *
 * @internal
 */
var RescopedStream = /** @class */ (function (_super) {
    __extends(RescopedStream, _super);
    // Constructor.
    function RescopedStream(stream, scope) {
        var _this = _super.call(this) || this;
        check(scope, "scope: string");
        check(stream, "stream: stream");
        _this._stream = stream;
        _this._scope = scope;
        return _this;
    }
    // Custom write method.
    RescopedStream.prototype.write = function (msg) {
        check(msg, "msg: string");
        this._stream.write(msg.replace("[semantic-release]", "[" + this._scope + "]"));
    };
    return RescopedStream;
}(Writable));
// Exports.
module.exports = RescopedStream;
