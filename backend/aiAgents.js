const fs = require("fs");
const path = require("path");

function detectProjectType(code) {
  if (!code) return "static";

  if (code.includes("express")) return "node";
  if (code.includes("react")) return "react";
  if (code.includes("def ")) return "python";

  return "static";
}

function buildProject(type, root, code) {
  const frontendPath = path.join(root, "frontend");
  const backendPath = path.join(root, "backend");

  if (!fs.existsSync(frontendPath)) fs.mkdirSync(frontendPath, { recursive: true });
  if (!fs.existsSync(backendPath)) fs.mkdirSync(backendPath, { recursive: true });

  if (type === "node") {
    fs.writeFileSync(
      path.join(backendPath, "generatedServer.js"),
      code
    );
  }

  if (type === "react") {
    fs.writeFileSync(
      path.join(frontendPath, "App.js"),
      code
    );
  }

  if (type === "static") {
    fs.writeFileSync(
      path.join(frontendPath, "index.html"),
      `<script>${code}</script>`
    );
  }

  return `Built ${type} project`;
}

module.exports = { detectProjectType, buildProject };
