"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTree = exports.ProjectTreeSourcesIterator = exports.ProjectTreeFactory = void 0;
const graphlib_1 = require("graphlib");
const object_hash_1 = __importDefault(require("object-hash"));
class ProjectTreeFactory {
    static createFromArray(packages) {
        const tree = new ProjectTree(new graphlib_1.Graph());
        packages.forEach(p => {
            tree.setNode(p);
        });
        packages.forEach(target => {
            const source = packages.find(({ name }) => target.deps.includes(name));
            if (source) {
                tree.setDependency(source, target);
            }
        });
        return new ProjectTreeSourcesIterator(tree);
    }
}
exports.ProjectTreeFactory = ProjectTreeFactory;
class ProjectTreeSourcesIterator {
    constructor(tree) {
        this.tree = tree;
    }
    hasNext() {
        return !this.tree.isEmpty();
    }
    next() {
        const sources = this.tree.sources();
        this.tree = this.tree.filter((n) => !sources.map(({ name }) => name).includes(n.name));
        return sources;
    }
}
exports.ProjectTreeSourcesIterator = ProjectTreeSourcesIterator;
class ProjectTree {
    constructor(tree) {
        this.tree = tree;
    }
    isEmpty() {
        return this.tree.sources().length === 0;
    }
    sources() {
        return this.tree.sources().map((name) => this.tree.node(name));
    }
    filter(predicate) {
        return new ProjectTree(this.tree.filterNodes((key) => {
            let v = this.tree.node(key);
            return predicate(v);
        }));
    }
    setNode(value) {
        this.tree.setNode(object_hash_1.default(value), value);
    }
    setDependency(source, target) {
        this.tree.setEdge(object_hash_1.default(source), object_hash_1.default(target));
    }
}
exports.ProjectTree = ProjectTree;
