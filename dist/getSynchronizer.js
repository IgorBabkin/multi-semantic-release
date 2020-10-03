var EventEmitter = require("promise-events");
var identity = require("lodash").identity;
var debug = require("debug")("msr:synchronizer");
/**
 * Cross-packages synchronization context.
 * @typedef Synchronizer
 * @param {EventEmitter} ee Shared event emitter class.
 * @param {Function} todo Gets the list of packages which are still todo
 * @param {Function} once Memoized event subscriber.
 * @param {Function} emit Memoized event emitter.
 * @params {Function} waitFor Function returns a promise that waits until the package has target probe value.
 * @params {Function} waitForAll Function returns a promise that waits until all the packages have the same target probe value.
 */
/**
 * Creates shared signal bus and its assets.
 * @param {Package[]} packages The multi-semantic-release context.
 * @returns {Synchronizer} Shared sync assets.
 */
var getSynchronizer = function (packages) {
    var ee = new EventEmitter();
    var getEventName = function (probe, pkg) { return "" + probe + (pkg ? ":" + pkg.name : ""); };
    // List of packages which are still todo (don't yet have a result).
    var todo = function () { return packages.filter(function (p) { return p.result === undefined; }); };
    // Emitter with memo: next subscribers will receive promises from the past if exists.
    var store = {
        evt: {},
        subscr: {},
    };
    var emit = function (probe, pkg) {
        var name = getEventName(probe, pkg);
        debug("ready: %s", name);
        return store.evt[name] || (store.evt[name] = ee.emit(name));
    };
    var once = function (probe, pkg) {
        var name = getEventName(probe, pkg);
        return store.evt[name] || store.subscr[name] || (store.subscr[name] = ee.once(name));
    };
    var waitFor = function (probe, pkg) {
        var name = getEventName(probe, pkg);
        return pkg[name] || (pkg[name] = once(probe, pkg));
    };
    // Status sync point.
    var waitForAll = function (probe, filter) {
        if (filter === void 0) { filter = identity; }
        var promise = once(probe);
        if (todo()
            .filter(filter)
            .every(function (p) { return p.hasOwnProperty(probe); })) {
            debug("ready: %s", probe);
            emit(probe);
        }
        return promise;
    };
    // Only the first lucky package passes the probe.
    var getLucky = function (probe, pkg) {
        if (getLucky[probe]) {
            return;
        }
        var name = getEventName(probe, pkg);
        debug("lucky: %s", name);
        getLucky[probe] = emit(probe, pkg);
    };
    return {
        ee: ee,
        emit: emit,
        once: once,
        todo: todo,
        waitFor: waitFor,
        waitForAll: waitForAll,
        getLucky: getLucky,
    };
};
module.exports = getSynchronizer;
