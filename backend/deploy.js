// Deployment actions are intentionally blocked until the integrations are
// replaced with reviewed, token-safe GitHub and Render API workflows.
async function deployProject(platform) {
  const allowed = ["github", "render"];
  if (!allowed.includes(platform)) {
    throw new Error("Unsupported deployment platform.");
  }
  throw new Error(
    "Automated deployment is disabled in this repository. Use the reviewed GitHub/Render deployment workflow."
  );
}

module.exports = { deployProject };
