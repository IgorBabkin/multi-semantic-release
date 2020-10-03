var getManifest = require("./getManifest");
var glob = require("./glob");
var checker = require("./blork").checker;
/**
 * Return array of package.json for Yarn workspaces.
 *
 * @param {string} cwd The current working directory where a package.json file can be found.
 * @returns {string[]} An array of package.json files corresponding to the workspaces setting in package.json
 */
function getWorkspacesYarn(cwd) {
    // Load package.json
    var manifest = getManifest(cwd + "/package.json");
    var packages = manifest.workspaces;
    if (packages && packages.packages) {
        packages = packages.packages;
    }
    // Only continue if manifest.workspaces or manifest.workspaces.packages is an array of strings.
    if (!checker("string[]+")(packages)) {
        throw new TypeError("package.json: workspaces or workspaces.packages: Must be non-empty array of string");
    }
    // Turn workspaces into list of package.json files.
    var workspaces = glob(packages.map(function (p) { return p.replace(/\/?$/, "/package.json"); }), {
        cwd: cwd,
        realpath: true,
        ignore: "**/node_modules/**",
    });
    // Must have at least one workspace.
    if (!workspaces.length)
        throw new TypeError("package.json: workspaces: Must contain one or more workspaces");
    // Return.
    return workspaces;
}
// Exports.
module.exports = getWorkspacesYarn;
