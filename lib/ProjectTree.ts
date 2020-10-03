import { Graph } from "graphlib";
import { IPackage } from "./IPackage";
import hash from "object-hash";

type Predicate<GInput> = (value: GInput) => boolean;

export class ProjectTreeFactory {
	static createFromArray(packages: IPackage[]) {
		const tree = new ProjectTree<IPackage>(new Graph());
		packages.forEach(p => {
			tree.setNode(p);
		});
		packages.forEach(target => {
			const source = packages.find(({name}) => target.deps.includes(name))
			if (source) {
				tree.setDependency(source, target);
			}
		});
		return new ProjectTreeSourcesIterator(tree);
	}
}

export class ProjectTreeSourcesIterator {
	constructor(private tree: ProjectTree<IPackage>) {
	}

	hasNext(): boolean {
		return !this.tree.isEmpty();
	}

	next(): IPackage[] {
		const sources = this.tree.sources();
		this.tree = this.tree.filter((n) => !sources.map(({name}) => name).includes(n.name));
		return sources;
	}
}

export class ProjectTree<GNode> {
	constructor(private tree: Graph) {
	}

	isEmpty(): boolean {
		return this.tree.sources().length === 0;
	}

	sources(): GNode[] {
		return this.tree.sources().map((name) => this.tree.node(name));
	}

	filter(predicate: Predicate<GNode>): ProjectTree<GNode> {
		return new ProjectTree(this.tree.filterNodes((key) => {
			let v = this.tree.node(key) as GNode;
			return predicate(v);
		}));
	}

	public setNode(value: GNode): void {
		this.tree.setNode(hash(value), value);
	}

	public setDependency(source: GNode, target: GNode): void {
		this.tree.setEdge(hash(source), hash(target));
	}
}
