"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTree = exports.ProjectTreeSourcesIterator = exports.ProjectTreeFactory = void 0;
var graphlib_1 = require("graphlib");
var object_hash_1 = __importDefault(require("object-hash"));
var ProjectTreeFactory = /** @class */ (function () {
    function ProjectTreeFactory() {
    }
    ProjectTreeFactory.createFromArray = function (packages) {
        var tree = new ProjectTree(new graphlib_1.Graph());
        packages.forEach(function (p) {
            tree.setNode(p);
        });
        packages.forEach(function (target) {
            var source = packages.find(function (_a) {
                var name = _a.name;
                return target.deps.includes(name);
            });
            if (source) {
                tree.setDependency(source, target);
            }
        });
        return new ProjectTreeSourcesIterator(tree);
    };
    return ProjectTreeFactory;
}());
exports.ProjectTreeFactory = ProjectTreeFactory;
var ProjectTreeSourcesIterator = /** @class */ (function () {
    function ProjectTreeSourcesIterator(tree) {
        this.tree = tree;
    }
    ProjectTreeSourcesIterator.prototype.hasNext = function () {
        return !this.tree.isEmpty();
    };
    ProjectTreeSourcesIterator.prototype.next = function () {
        var sources = this.tree.sources();
        this.tree = this.tree.filter(function (n) { return !sources.map(function (_a) {
            var name = _a.name;
            return name;
        }).includes(n.name); });
        return sources;
    };
    return ProjectTreeSourcesIterator;
}());
exports.ProjectTreeSourcesIterator = ProjectTreeSourcesIterator;
var ProjectTree = /** @class */ (function () {
    function ProjectTree(tree) {
        this.tree = tree;
    }
    ProjectTree.prototype.isEmpty = function () {
        return this.tree.sources().length === 0;
    };
    ProjectTree.prototype.sources = function () {
        var _this = this;
        return this.tree.sources().map(function (name) { return _this.tree.node(name); });
    };
    ProjectTree.prototype.filter = function (predicate) {
        var _this = this;
        return new ProjectTree(this.tree.filterNodes(function (key) {
            var v = _this.tree.node(key);
            return predicate(v);
        }));
    };
    ProjectTree.prototype.setNode = function (value) {
        this.tree.setNode(object_hash_1.default(value), value);
    };
    ProjectTree.prototype.setDependency = function (source, target) {
        this.tree.setEdge(object_hash_1.default(source), object_hash_1.default(target));
    };
    return ProjectTree;
}());
exports.ProjectTree = ProjectTree;
