var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a = require("path"), relative = _a.relative, resolve = _a.resolve;
var gitLogParser = require("git-log-parser");
var execa = require("execa");
var _b = require("./blork"), check = _b.check, ValueError = _b.ValueError;
var getStream = require("get-stream");
var cleanPath = require("./cleanPath");
var debug = require("debug")("msr:commitsFilter");
/**
 * Retrieve the list of commits on the current branch since the commit sha associated with the last release, or all the commits of the current branch if there is no last released version.
 * Commits are filtered to only return those that corresponding to the package directory.
 *
 * This is achieved by using "-- my/dir/path" with `git log` — passing this into gitLogParser() with
 *
 * @param {string} cwd Absolute path of the working directory the Git repo is in.
 * @param {string} dir Path to the target directory to filter by. Either absolute, or relative to cwd param.
 * @param {string|void} lastHead The SHA of the previous release
 * @param {string|void} firstParentBranch first-parent to determine which merges went into master
 * @return {Promise<Array<Commit>>} The list of commits on the branch `branch` since the last release.
 */
function getCommitsFiltered(cwd, dir, lastHead, firstParentBranch) {
    if (lastHead === void 0) { lastHead = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var root, relpath, firstParentBranchFilter, gitLogFilterQuery, stream, commits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Clean paths and make sure directories exist.
                    check(cwd, "cwd: directory");
                    check(dir, "dir: path");
                    cwd = cleanPath(cwd);
                    dir = cleanPath(dir, cwd);
                    check(dir, "dir: directory");
                    check(lastHead, "lastHead: alphanumeric{40}?");
                    // target must be inside and different than cwd.
                    if (dir.indexOf(cwd) !== 0)
                        throw new ValueError("dir: Must be inside cwd", dir);
                    if (dir === cwd)
                        throw new ValueError("dir: Must not be equal to cwd", dir);
                    return [4 /*yield*/, execa("git", ["rev-parse", "--show-toplevel"], { cwd: cwd })];
                case 1:
                    root = (_a.sent()).stdout;
                    // Add correct fields to gitLogParser.
                    Object.assign(gitLogParser.fields, {
                        hash: "H",
                        message: "B",
                        gitTags: "d",
                        committerDate: { key: "ci", type: Date },
                    });
                    relpath = relative(root, dir);
                    firstParentBranchFilter = firstParentBranch ? ["--first-parent", firstParentBranch] : [];
                    gitLogFilterQuery = __spreadArrays(firstParentBranchFilter, [lastHead ? lastHead + "..HEAD" : "HEAD", "--", relpath]);
                    stream = gitLogParser.parse({ _: gitLogFilterQuery }, { cwd: cwd, env: process.env });
                    return [4 /*yield*/, getStream.array(stream)];
                case 2:
                    commits = _a.sent();
                    // Trim message and tags.
                    commits.forEach(function (commit) {
                        commit.message = commit.message.trim();
                        commit.gitTags = commit.gitTags.trim();
                    });
                    debug("git log filter query: %o", gitLogFilterQuery);
                    debug("filtered commits: %O", commits);
                    // Return the commits.
                    return [2 /*return*/, commits];
            }
        });
    });
}
// Exports.
module.exports = getCommitsFiltered;
