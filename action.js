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

const run = async (octokit, context) => {
  const { owner, repo, number: pull_number } = context.issue;

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

  const benchmarkFile = path.resolve(
    cwd,
    "pacakges/teleport-test/src/bench.js"
  );
  if (benchmarkFile) {
    let myOutput = "";
    let myError = "";

    const options = {};
    // @ts-ignore
    options.listeners = {
      stdout: data => {
        myOutput += data.toString();
      },
      stderr: data => {
        myError += data.toString();
      }
    };

    await exec(`node packages/teleport-test/src/bench.js`, options);

    console.log(`Error from running benchmarks ${myError}`);

    console.log(`Output after running benchmark ${myOutput}`);
    endGroup();
  } else {
    setFailed("Failed in finding the benchmark folder");
    throw new Error("Failed in finding the benchmark folder");
  }
};

(async () => {
  try {
    const token = getInput("secret-token", { required: true });
    const octokit = new GitHub(token);
    await run(octokit, context);
  } catch (e) {
    setFailed(e.message);
  }
})();
