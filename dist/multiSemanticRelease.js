"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var ProjectTree_1 = require("./ProjectTree");
var dirname = require("path").dirname;
var semanticRelease = require("semantic-release");
var check = require("./blork").check;
var getLogger = require("./getLogger");
var getSynchronizer = require("./getSynchronizer");
var getConfig = require("./getConfig");
var getConfigSemantic = require("./getConfigSemantic");
var getManifest = require("./getManifest");
var cleanPath = require("./cleanPath");
var RescopedStream = require("./RescopedStream");
var createInlinePluginCreator = require("./createInlinePluginCreator");
/**
 * The multirelease context.
 * @typedef MultiContext
 * @param {Package[]} packages Array of all packages in this multirelease.
 * @param {Package[]} releasing Array of packages that will release.
 * @param {string} cwd The current working directory.
 * @param {Object} env The environment variables.
 * @param {Logger} logger The logger for the multirelease.
 * @param {Stream} stdout The output stream for this multirelease.
 * @param {Stream} stderr The error stream for this multirelease.
 */
/**
 * Details about an individual package in a multirelease
 * @typedef Package
 * @param {string} path String path to `package.json` for the package.
 * @param {string} dir The working directory for the package.
 * @param {string} name The name of the package, e.g. `my-amazing-package`
 * @param {string[]} deps Array of all dependency package names for the package (merging dependencies, devDependencies, peerDependencies).
 * @param {Package[]} localDeps Array of local dependencies this package relies on.
 * @param {context|void} context The semantic-release context for this package's release (filled in once semantic-release runs).
 * @param {undefined|Result|false} result The result of semantic-release (object with lastRelease, nextRelease, commits, releases), false if this package was skipped (no changes or similar), or undefined if the package's release hasn't completed yet.
 */
/**
 * Perform a multirelease.
 *
 * @param {string[]} paths An array of paths to package.json files.
 * @param {Object} inputOptions An object containing semantic-release options.
 * @param {Object} settings An object containing: cwd, env, stdout, stderr (mainly for configuring tests).
 * @param {Object} flags Argv flags.
 * @returns {Promise<Package[]>} Promise that resolves to a list of package objects with `result` property describing whether it released or not.
 */
function multiSemanticRelease(paths, inputOptions, _a, flags) {
    if (inputOptions === void 0) { inputOptions = {}; }
    var _b = _a === void 0 ? {} : _a, _c = _b.cwd, cwd = _c === void 0 ? process.cwd() : _c, _d = _b.env, env = _d === void 0 ? process.env : _d, _e = _b.stdout, stdout = _e === void 0 ? process.stdout : _e, _f = _b.stderr, stderr = _f === void 0 ? process.stderr : _f;
    if (flags === void 0) { flags = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var logger, globalOptions, options, multiContext, packages, synchronizer, getLucky, waitFor, createInlinePlugin, iterator, sourcePackages, released;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    // Check params.
                    check(paths, "paths: string[]");
                    check(cwd, "cwd: directory");
                    check(env, "env: objectlike");
                    check(stdout, "stdout: stream");
                    check(stderr, "stderr: stream");
                    cwd = cleanPath(cwd);
                    logger = getLogger({ stdout: stdout, stderr: stderr });
                    logger.complete("Started multirelease! Loading " + paths.length + " packages...");
                    return [4 /*yield*/, getConfig(cwd)];
                case 1:
                    globalOptions = _g.sent();
                    options = Object.assign({}, globalOptions, inputOptions);
                    multiContext = { options: options, cwd: cwd, env: env, stdout: stdout, stderr: stderr };
                    return [4 /*yield*/, Promise.all(paths.map(function (path) { return getPackage(path, multiContext); }))];
                case 2:
                    packages = _g.sent();
                    packages.forEach(function (pkg) { return logger.success("Loaded package " + pkg.name); });
                    logger.complete("Queued " + packages.length + " packages! Starting release...");
                    synchronizer = getSynchronizer(packages);
                    getLucky = synchronizer.getLucky, waitFor = synchronizer.waitFor;
                    createInlinePlugin = createInlinePluginCreator(packages, multiContext, synchronizer, flags);
                    iterator = ProjectTree_1.ProjectTreeFactory.createFromArray(packages);
                    _g.label = 3;
                case 3:
                    if (!iterator.hasNext()) return [3 /*break*/, 5];
                    sourcePackages = iterator.next();
                    logger.complete("Queued sources " + sourcePackages.map(function (_a) {
                        var name = _a.name;
                        return name;
                    }).join(", "));
                    return [4 /*yield*/, Promise.all(sourcePackages.map(function (pkg) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!flags.sequentialInit) return [3 /*break*/, 2];
                                        getLucky("_readyForRelease", pkg);
                                        return [4 /*yield*/, waitFor("_readyForRelease", pkg)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, releasePackage(pkg, createInlinePlugin, multiContext)];
                                }
                            });
                        }); }))];
                case 4:
                    _g.sent();
                    return [3 /*break*/, 3];
                case 5:
                    released = packages.filter(function (pkg) { return pkg.result; }).length;
                    // Return packages list.
                    logger.complete("Released " + released + " of " + packages.length + " packages, semantically!");
                    return [2 /*return*/, packages];
            }
        });
    });
}
// Exports.
module.exports = multiSemanticRelease;
/**
 * Load details about a package.
 *
 * @param {string} path The path to load details about.
 * @param {Object} allOptions Options that apply to all packages.
 * @param {MultiContext} multiContext Context object for the multirelease.
 * @returns {Promise<Package|void>} A package object, or void if the package was skipped.
 *
 * @internal
 */
function getPackage(path, _a) {
    var globalOptions = _a.options, env = _a.env, cwd = _a.cwd, stdout = _a.stdout, stderr = _a.stderr;
    return __awaiter(this, void 0, void 0, function () {
        var dir, manifest, name, deps, pkgOptions, finalOptions, logger, _b, options, plugins;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Make path absolute.
                    path = cleanPath(path, cwd);
                    dir = dirname(path);
                    manifest = getManifest(path);
                    name = manifest.name;
                    deps = Object.keys(__assign(__assign(__assign(__assign({}, manifest.dependencies), manifest.devDependencies), manifest.peerDependencies), manifest.optionalDependencies));
                    return [4 /*yield*/, getConfig(dir)];
                case 1:
                    pkgOptions = (_c.sent()).options;
                    finalOptions = Object.assign({}, globalOptions, pkgOptions);
                    logger = { error: function () { }, log: function () { } };
                    return [4 /*yield*/, getConfigSemantic({ cwd: dir, env: env, stdout: stdout, stderr: stderr, logger: logger }, finalOptions)];
                case 2:
                    _b = _c.sent(), options = _b.options, plugins = _b.plugins;
                    // Return package object.
                    return [2 /*return*/, { path: path, dir: dir, name: name, manifest: manifest, deps: deps, options: options, plugins: plugins, loggerRef: logger }];
            }
        });
    });
}
/**
 * Release an individual package.
 *
 * @param {Package} pkg The specific package.
 * @param {Function} createInlinePlugin A function that creates an inline plugin.
 * @param {MultiContext} multiContext Context object for the multirelease.
 * @returns {Promise<void>} Promise that resolves when done.
 *
 * @internal
 */
function releasePackage(pkg, createInlinePlugin, multiContext) {
    return __awaiter(this, void 0, void 0, function () {
        var pkgOptions, name, dir, env, stdout, stderr, inlinePlugin, options, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pkgOptions = pkg.options, name = pkg.name, dir = pkg.dir;
                    env = multiContext.env, stdout = multiContext.stdout, stderr = multiContext.stderr;
                    inlinePlugin = createInlinePlugin(pkg);
                    options = __assign(__assign({}, pkgOptions), inlinePlugin);
                    // Add the package name into tagFormat.
                    // Thought about doing a single release for the tag (merging several packages), but it's impossible to prevent Github releasing while allowing NPM to continue.
                    // It'd also be difficult to merge all the assets into one release without full editing/overriding the plugins.
                    options.tagFormat = name + "@${version}";
                    // This options are needed for plugins that does not rely on `pluginOptions` and extracts them independently.
                    options._pkgOptions = pkgOptions;
                    // Call semanticRelease() on the directory and save result to pkg.
                    // Don't need to log out errors as semantic-release already does that.
                    _a = pkg;
                    return [4 /*yield*/, semanticRelease(options, {
                            cwd: dir,
                            env: env,
                            stdout: new RescopedStream(stdout, name),
                            stderr: new RescopedStream(stderr, name),
                        })];
                case 1:
                    // Call semanticRelease() on the directory and save result to pkg.
                    // Don't need to log out errors as semantic-release already does that.
                    _a.result = _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
