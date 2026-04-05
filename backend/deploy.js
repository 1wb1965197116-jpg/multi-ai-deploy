const path = require("path");

const { checkAndFixProject } = require("./deployChecker");
const { createRepo, pushToGitHub } = require("./githubDeploy");
const { triggerRenderDeploy } = require("./renderDeploy");

async function deployProject() {
  const root = path.join(__dirname, "..");

  const fixes = checkAndFixProject(root);
  console.log("Fixes:", fixes);

  const repoUrl = await createRepo();
  pushToGitHub(repoUrl);

  await triggerRenderDeploy();

  console.log("🚀 Deployment complete");
}

module.exports = { deployProject };
