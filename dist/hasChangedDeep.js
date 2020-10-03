var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * Have a package's local deps changed? Checks recursively.
 *
 * @param {Package[]} packages The package with local deps to check.
 * @param {Package[]} ignore=[] Packages to ignore (to prevent infinite loops).
 * @returns {boolean} `true` if any deps have changed and `false` otherwise
 *
 * @internal
 */
function hasChangedDeep(packages, ignore) {
    if (ignore === void 0) { ignore = []; }
    // Has changed if...
    return packages
        .filter(function (p) { return ignore.indexOf(p) === -1; })
        .some(function (p) {
        // 1. Any local dep package itself has changed
        if (p._nextType)
            return true;
        // 2. Any local dep package has local deps that have changed.
        else if (hasChangedDeep(p._localDeps, __spreadArrays(ignore, packages)))
            return true;
        // Nope.
        else
            return false;
    });
}
// Exports.
module.exports = hasChangedDeep;
