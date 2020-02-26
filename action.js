import path from "path";
import {
  getInput,
  setFailed,
  debug,
  startGroup,
  endGroup
} from "@actions/core";
import { GitHub, context } from "@actions/github";
import { exec } from "@actions/exec";

const run = async (context, customPath) => {
  const pr = context.payload.pull_request;
  try {
    debug("pr" + JSON.stringify(pr, null, 2));
  } catch (e) {}
  if (!pr) {
    throw Error(
      `Could not retrieve PR information. Only "pull_request" triggered workflows are currently supported.`
    );
  }

  const cwd = process.cwd();
  const installScript = `yarn --frozen-lockfile`;

  startGroup(`[current] Installing Dependencies`);
  console.log(`Installing Dependencies using ${installScript}`);
  await exec(installScript);
  endGroup();

  startGroup(`[current] Building and Bootstrapping with Lerna`);
  console.log(`Building and Bootstrapping with lerna`);
  await exec(`yarn build`);
  endGroup();

  startGroup(`[current] Displaying fodlers`);
  await exec(`ls`);
  endGroup();

  startGroup(`[current] Running Benchmarks`);
  console.log(`Running benchmarks`);

  const benchmarkFilePath = customPath ? customPath : "bench.js";
  const benchFile = path.resolve(cwd, benchmarkFilePath);

  console.log(`Executing benchmark at ${benchFile}`);

  if (benchFile) {
    await exec(`node ${benchmarkFilePath}`, options);
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
    await run(context, customPath);
  } catch (e) {
    setFailed(e.message);
  }
})();
