const path = require("path");
const { checkAndFixProject } = require("./deployChecker");
const { createRepo, pushToGitHub } = require("./githubDeploy");
const { triggerRenderDeploy } = require("./renderDeploy");

async function deployProject(projectName) {
  const rootDir = path.join(__dirname, "..");

  // ✅ Step 1: Fix project
  const fixes = checkAndFixProject(rootDir);
  console.log("Fixes:", fixes);

  // ✅ Step 2: Create GitHub repo
  const repoUrl = await createRepo();
  console.log("Repo created:", repoUrl);

  // ✅ Step 3: Push code
  pushToGitHub(repoUrl);

  // ✅ Step 4: Deploy to Render
  await triggerRenderDeploy();

  console.log("🚀 FULL AUTO DEPLOY COMPLETE");
}

module.exports = { deployProject };
