const { checkAndFixProject } = require("./deployChecker");
const path = require("path");

async function deployProject(projectName) {
  const rootDir = path.join(__dirname, "..");

  // ✅ Run AI fix
  const fixes = checkAndFixProject(rootDir);

  if (fixes.length > 0) {
    console.log("Auto-fixes applied:");
    fixes.forEach(f => console.log(f));
  } else {
    console.log("Project already deployable");
  }

  // 🚀 Continue deploy (GitHub / Render logic here)
  console.log("Deploying project...");
}

module.exports = { deployProject };
