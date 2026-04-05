const fs = require("fs");
const path = require("path");

function ensureFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    return `Created: ${filePath}`;
  }
  return null;
}

function checkAndFixProject(rootDir) {
  let fixes = [];

  // ✅ Ensure frontend folder + index.html
  const frontendPath = path.join(rootDir, "frontend");
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath);
    fixes.push("Created frontend folder");
  }

  const indexPath = path.join(frontendPath, "index.html");
  fixes.push(
    ensureFile(
      indexPath,
      `<h1>Multi-AI Deploy Running</h1>`
    )
  );

  // ✅ Ensure backend server
  const backendPath = path.join(rootDir, "backend");
  if (!fs.existsSync(backendPath)) {
    fs.mkdirSync(backendPath);
    fixes.push("Created backend folder");
  }

  const serverPath = path.join(backendPath, "server.js");
  fixes.push(
    ensureFile(
      serverPath,
`const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);`
    )
  );

  // ✅ Ensure package.json
  const packagePath = path.join(rootDir, "package.json");
  fixes.push(
    ensureFile(
      packagePath,
`{
  "name": "multi-ai-deploy",
  "version": "1.0.0",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
    )
  );

  return fixes.filter(Boolean);
}

module.exports = { checkAndFixProject };
