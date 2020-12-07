import { RequestHandler } from "express";
import got from "got";
import type { DepTask, NPMPackage, Package } from "./types";
import { queue } from "async";
import { maxSatisfying } from "semver";

async function findPackageDependencies(rootName: string, rootVersion: string) {
  const deps: Record<number, Package> = {};
  let nextId = 0;

  const q = queue<DepTask>(async (task) => {
    console.log("task", task);
    const { id, name, version } = task;
    let npmPackage: NPMPackage;
    try {
      npmPackage = await got(`https://registry.npmjs.org/${name}`).json();
    } catch (err) {
      throw new Error(`Cannot find the package "${name}"`);
    }
    const allVersions = Object.keys(npmPackage.versions);
    const _version = version === "latest" ? "*" : version;
    const resolvedVersion = maxSatisfying(allVersions, _version);

    if (!resolvedVersion) {
      throw new Error(
        `Could not resolve version for package ${name} and range ${version}`
      );
    }

    console.log(`Resolved package ${name} with version ${resolvedVersion}`);
    const resolvedPackage: Package = { name, version: resolvedVersion };
    deps[id] = resolvedPackage;

    const dependencies = npmPackage.versions[resolvedVersion].dependencies;
    if (dependencies) {
      resolvedPackage.dependencies = [];
      for (const [depName, depVersion] of Object.entries(dependencies)) {
        resolvedPackage.dependencies.push(++nextId);
        q.push({ id: nextId, name: depName, version: depVersion });
      }
    }
  }, 10);

  q.push({ id: nextId, name: rootName, version: rootVersion });

  await Promise.race([q.drain(), q.error()]);
  return deps;
}

export const getPackage: RequestHandler = async function (req, res) {
  const { name, version } = req.params;

  try {
    const depsGraph = await findPackageDependencies(name, version);
    return res.status(200).json(depsGraph);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
