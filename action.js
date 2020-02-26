import path from "path";
import { getInput, setFailed, startGroup, endGroup } from "@actions/core";
import { exec } from "@actions/exec";

const run = async options => {
  const { customPath, lint, test, coverage } = options;

  const cwd = process.cwd();
  const installScript = `yarn --frozen-lockfile`;

  startGroup(`[Dependencies] Installing Dependencies`);
  console.log(`Installing Dependencies using ${installScript}`);
  await exec(installScript);
  endGroup();

  startGroup(`[Building] Building and Bootstrapping with Lerna`);
  console.log(`Building and Bootstrapping with lerna`);
  await exec(`yarn build`);
  endGroup();

  if (lint) {
    startGroup(`[Linting] Running lint on all files`);
    await exec(`yarn lint`);
    endGroup();
  }

  if (test) {
    startGroup(`[Tests] Running test cases`);
    await exec(test);
    endGroup();
  }

  if (coverage) {
    startGroup(`[Coverage] Uploading coverage`);
    await exec(coverage);
    endGroup();
  }

  startGroup(`[Benchmarking] Running Benchmarks`);
  console.log(`Running benchmarks`);

  const benchmarkFilePath = customPath ? customPath : "bench.js";
  const benchFile = path.resolve(cwd, benchmarkFilePath);

  console.log(`Executing benchmark at ${benchFile}`);

  if (benchFile) {
    await exec(`node ${benchmarkFilePath}`);
    endGroup();
  } else {
    setFailed("Failed in finding the benchmark folder");
    throw new Error(
      `Failed in finding the benchmark folder, working directory ${cwd}`
    );
  }
};

(async () => {
  try {
    const customPath = getInput("benchmark-path");
    const lint = getInput("lint") ? true : false;
    const test = getInput("test");
    const coverage = getInput("coverage");
    const options = {
      customPath,
      lint,
      test,
      coverage
    };
    await run(options);
  } catch (e) {
    setFailed(e.message);
  }
})();
