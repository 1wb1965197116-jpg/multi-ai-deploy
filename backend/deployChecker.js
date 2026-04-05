const fs = require("fs");
const path = require("path");

function ensure(file, content) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    return "Created " + file;
  }
}

function checkAndFixProject(root) {
  let fixes = [];

  fixes.push(
    ensure(
      path.join(root, "frontend/index.html"),
      "<h1>Multi-AI Running</h1>"
    )
  );

  fixes.push(
    ensure(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "multi-ai",
        version: "1.0.0",
        main: "backend/server.js",
        scripts: { start: "node backend/server.js" },
        dependencies: { express: "^4.18.2" }
      })
    )
  );

  return fixes.filter(Boolean);
}

function getProjectStatus(root) {
  let status = [];

  if (!fs.existsSync(path.join(root, "package.json"))) {
    status.push({ msg: "Missing package.json", color: "red" });
  }

  if (!fs.existsSync(path.join(root, "frontend/index.html"))) {
    status.push({ msg: "Missing index.html", color: "red" });
  }

  if (status.length === 0) {
    status.push({ msg: "Ready for deploy", color: "green" });
  }

  return status;
}

module.exports = { checkAndFixProject, getProjectStatus };
