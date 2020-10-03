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
var writeFileSync = require("fs").writeFileSync;
var debug = require("debug")("msr:inlinePlugin");
var getCommitsFiltered = require("./getCommitsFiltered");
var getManifest = require("./getManifest");
var hasChangedDeep = require("./hasChangedDeep");
var recognizeFormat = require("./recognizeFormat");
var get = require("lodash").get;
/**
 * Create an inline plugin creator for a multirelease.
 * This is caused once per multirelease and returns a function which should be called once per package within the release.
 *
 * @param {Package[]} packages The multi-semantic-release context.
 * @param {MultiContext} multiContext The multi-semantic-release context.
 * @param {Synchronizer} synchronizer Shared synchronization assets
 * @param {Object} flags argv options
 * @returns {Function} A function that creates an inline package.
 *
 * @internal
 */
function createInlinePluginCreator(packages, multiContext, synchronizer, flags) {
    // Vars.
    var cwd = multiContext.cwd;
    var todo = synchronizer.todo, waitFor = synchronizer.waitFor, waitForAll = synchronizer.waitForAll, emit = synchronizer.emit, getLucky = synchronizer.getLucky;
    /**
     * Update pkg deps.
     * @param {Package} pkg The package this function is being called on.
     * @param {string} path Path to package.json file
     * @returns {undefined}
     * @internal
     */
    var updateManifestDeps = function (pkg, path) {
        // Get and parse manifest file contents.
        var manifest = getManifest(path);
        var _a = recognizeFormat(manifest.__contents__), indent = _a.indent, trailingWhitespace = _a.trailingWhitespace;
        var updateDependency = function (scope, name, version) {
            if (get(manifest, scope + "." + name)) {
                manifest[scope][name] = version;
            }
        };
        // Loop through localDeps to update dependencies/devDependencies/peerDependencies in manifest.
        pkg._localDeps.forEach(function (d) {
            // Get version of dependency.
            var release = d._nextRelease || d._lastRelease;
            // Cannot establish version.
            if (!release || !release.version)
                throw Error("Cannot release because dependency " + d.name + " has not been released");
            // Update version of dependency in manifest.
            updateDependency("dependencies", d.name, release.version);
            updateDependency("devDependencies", d.name, release.version);
            updateDependency("peerDependencies", d.name, release.version);
            updateDependency("optionalDependencies", d.name, release.version);
        });
        // Write package.json back out.
        writeFileSync(path, JSON.stringify(manifest, null, indent) + trailingWhitespace);
    };
    /**
     * Create an inline plugin for an individual package in a multirelease.
     * This is called once per package and returns the inline plugin used for semanticRelease()
     *
     * @param {Package} pkg The package this function is being called on.
     * @returns {Object} A semantic-release inline plugin containing plugin step functions.
     *
     * @internal
     */
    function createInlinePlugin(pkg) {
        var _this = this;
        // Vars.
        var deps = pkg.deps, plugins = pkg.plugins, dir = pkg.dir, path = pkg.path, name = pkg.name;
        /**
         * @var {Commit[]} List of _filtered_ commits that only apply to this package.
         */
        var commits;
        /**
         * @param {object} pluginOptions Options to configure this plugin.
         * @param {object} context The semantic-release context.
         * @returns {Promise<void>} void
         * @internal
         */
        var verifyConditions = function (pluginOptions, context) { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Restore context for plugins that does not rely on parsed opts.
                        Object.assign(context.options, context.options._pkgOptions);
                        // And bind actual logger.
                        Object.assign(pkg.loggerRef, context.logger);
                        pkg._ready = true;
                        emit("_readyForRelease", todo().find(function (p) { return !p._ready; }));
                        return [4 /*yield*/, plugins.verifyConditions(context)];
                    case 1:
                        res = _a.sent();
                        debug("verified conditions: %s", pkg.name);
                        return [2 /*return*/, res];
                }
            });
        }); };
        /**
         * Analyze commits step.
         * Responsible for determining the type of the next release (major, minor or patch). If multiple plugins with a analyzeCommits step are defined, the release type will be the highest one among plugins output.
         *
         * In multirelease: Returns "patch" if the package contains references to other local packages that have changed, or null if this package references no local packages or they have not changed.
         * Also updates the `context.commits` setting with one returned from `getCommitsFiltered()` (which is filtered by package directory).
         *
         * @param {object} pluginOptions Options to configure this plugin.
         * @param {object} context The semantic-release context.
         * @returns {Promise<void>} Promise that resolves when done.
         *
         * @internal
         */
        var analyzeCommits = function (pluginOptions, context) { return __awaiter(_this, void 0, void 0, function () {
            var firstParentBranch, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        firstParentBranch = flags.firstParent ? context.branch.name : undefined;
                        return [4 /*yield*/, getCommitsFiltered(cwd, dir, context.lastRelease.gitHead, firstParentBranch)];
                    case 1:
                        // Filter commits by directory.
                        commits = _b.sent();
                        // Set context.commits so analyzeCommits does correct analysis.
                        context.commits = commits;
                        // Set lastRelease for package from context.
                        pkg._lastRelease = context.lastRelease;
                        // Make a list of local dependencies.
                        // Map dependency names (e.g. my-awesome-dep) to their actual package objects in the packages array.
                        pkg._localDeps = deps.map(function (d) { return packages.find(function (p) { return d === p.name; }); }).filter(Boolean);
                        // Set nextType for package from plugins.
                        _a = pkg;
                        return [4 /*yield*/, plugins.analyzeCommits(context)];
                    case 2:
                        // Set nextType for package from plugins.
                        _a._nextType = _b.sent();
                        // Wait until all todo packages have been analyzed.
                        pkg._analyzed = true;
                        return [4 /*yield*/, waitForAll("_analyzed")];
                    case 3:
                        _b.sent();
                        // Make sure type is "patch" if the package has any deps that have changed.
                        if (!pkg._nextType && hasChangedDeep(pkg._localDeps))
                            pkg._nextType = "patch";
                        debug("commits analyzed: %s", pkg.name);
                        debug("release type: %s", pkg._nextType);
                        // Return type.
                        return [2 /*return*/, pkg._nextType];
                }
            });
        }); };
        /**
         * Generate notes step (after).
         * Responsible for generating the content of the release note. If multiple plugins with a generateNotes step are defined, the release notes will be the result of the concatenation of each plugin output.
         *
         * In multirelease: Edit the H2 to insert the package name and add an upgrades section to the note.
         * We want this at the _end_ of the release note which is why it's stored in steps-after.
         *
         * Should look like:
         *
         *     ## my-amazing-package [9.2.1](github.com/etc) 2018-12-01
         *
         *     ### Features
         *
         *     * etc
         *
         *     ### Dependencies
         *
         *     * **my-amazing-plugin:** upgraded to 1.2.3
         *     * **my-other-plugin:** upgraded to 4.9.6
         *
         * @param {object} pluginOptions Options to configure this plugin.
         * @param {object} context The semantic-release context.
         * @returns {Promise<void>} Promise that resolves to the string
         *
         * @internal
         */
        var generateNotes = function (pluginOptions, context) { return __awaiter(_this, void 0, void 0, function () {
            var notes, subs, upgrades, bullets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set nextRelease for package.
                        pkg._nextRelease = context.nextRelease;
                        // Wait until all todo packages are ready to generate notes.
                        return [4 /*yield*/, waitForAll("_nextRelease", function (p) { return p._nextType; })];
                    case 1:
                        // Wait until all todo packages are ready to generate notes.
                        _a.sent();
                        // Wait until the current pkg is ready to generate notes
                        getLucky("_readyToGenerateNotes", pkg);
                        return [4 /*yield*/, waitFor("_readyToGenerateNotes", pkg)];
                    case 2:
                        _a.sent();
                        // Update pkg deps.
                        updateManifestDeps(pkg, path);
                        pkg._depsUpdated = true;
                        notes = [];
                        // Set context.commits so analyzeCommits does correct analysis.
                        // We need to redo this because context is a different instance each time.
                        context.commits = commits;
                        return [4 /*yield*/, plugins.generateNotes(context)];
                    case 3:
                        subs = _a.sent();
                        // istanbul ignore else (unnecessary to test)
                        if (subs)
                            notes.push(subs.replace(/^(#+) (\[?\d+\.\d+\.\d+\]?)/, "$1 " + name + " $2"));
                        upgrades = pkg._localDeps.filter(function (d) { return d._nextRelease; });
                        if (upgrades.length) {
                            notes.push("### Dependencies");
                            bullets = upgrades.map(function (d) { return "* **" + d.name + ":** upgraded to " + d._nextRelease.version; });
                            notes.push(bullets.join("\n"));
                        }
                        debug("notes generated: %s", pkg.name);
                        // Return the notes.
                        return [2 /*return*/, notes.join("\n\n")];
                }
            });
        }); };
        var publish = function (pluginOptions, context) { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pkg._prepared = true;
                        emit("_readyToGenerateNotes", todo().find(function (p) { return p._nextType && !p._prepared; }));
                        // Wait for all packages to be `prepare`d and tagged by `semantic-release`
                        return [4 /*yield*/, waitForAll("_prepared", function (p) { return p._nextType; })];
                    case 1:
                        // Wait for all packages to be `prepare`d and tagged by `semantic-release`
                        _a.sent();
                        return [4 /*yield*/, plugins.publish(context)];
                    case 2:
                        res = _a.sent();
                        debug("published: %s", pkg.name);
                        // istanbul ignore next
                        return [2 /*return*/, res.length ? res[0] : {}];
                }
            });
        }); };
        var inlinePlugin = {
            verifyConditions: verifyConditions,
            analyzeCommits: analyzeCommits,
            generateNotes: generateNotes,
            publish: publish,
        };
        // Add labels for logs.
        Object.keys(inlinePlugin).forEach(function (type) {
            return Reflect.defineProperty(inlinePlugin[type], "pluginName", {
                value: "Inline plugin",
                writable: false,
                enumerable: true,
            });
        });
        debug("inlinePlugin created: %s", pkg.name);
        return inlinePlugin;
    }
    // Return creator function.
    return createInlinePlugin;
}
// Exports.
module.exports = createInlinePluginCreator;
