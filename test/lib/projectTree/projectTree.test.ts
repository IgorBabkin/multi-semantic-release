import { ProjectTree, ProjectTreeFactory } from "../../../lib/ProjectTree";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

describe("ProjectTree", () => {
	test("Relative without CWD", async () => {
		const expected = [
			["@igorbabkin/b"],
			["@igorbabkin/a", "test2", "test3"],
		];
		const packages = require("./packages.json");
		const projectTreeService = ProjectTreeFactory.createFromArray(packages);
		let i = 1;
		while (projectTreeService.hasNext()) {
			const v = await Promise.all(projectTreeService.next().map(async (pkg) => {
				await sleep(i * 1000);
				return pkg;
			}))
			expect(v.map(({name}) => name)).toEqual(expected.shift());
			i--;
		}
	});
});
