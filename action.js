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
  console.log(pr);
  try {
    debug("pr" + JSON.stringify(pr, null, 2));
  } catch (e) {}
  if (!pr) {
    throw Error(
      `Could not retrieve PR information. Only "pull_request" triggered workflows are currently supported.`
    );
  }

  console.log(
    `PR #${pull_number} is targetted at ${pr.base.ref} (${pr.base.sha})`
  );

  const cwd = process.cwd();
  console.log(cwd);

  startGroup(`[current] Installing Dependencies`);
  console.log(`Installing Dependencies using ${installScript}`);
  await exec(`yarn --frozen-lockfile`);
  endGroup();

  startGroup(`[current] Building and Bootstrapping with Lerna`);
  console.log(`Building and Bootstrapping with lerna`);
  await exec(`yarn build`);
  endGroup();

  startGroup;
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
