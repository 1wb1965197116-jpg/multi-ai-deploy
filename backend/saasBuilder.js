const fs = require("fs");
const path = require("path");

function generateSaaS(prompt, root) {
  const projectPath = path.join(root, "generated-app");

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
  }

  // Basic SaaS template
  fs.writeFileSync(
    path.join(projectPath, "index.html"),
    `<h1>${prompt}</h1><p>SaaS App Generated</p>`
  );

  fs.writeFileSync(
    path.join(projectPath, "server.js"),
    `
const express = require("express");
const app = express();

app.get("/", (req,res)=>res.send("SaaS Running"));

app.listen(3000);
`
  );

  return "🚀 SaaS App Generated";
}

module.exports = { generateSaaS };
