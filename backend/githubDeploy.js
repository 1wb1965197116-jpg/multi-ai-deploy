const axios = require("axios");
const { execSync } = require("child_process");

async function createRepo() {
  const res = await axios.post(
    "https://api.github.com/user/repos",
    { name: process.env.REPO_NAME },
    { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
  );

  return res.data.clone_url;
}

function pushToGitHub(repoUrl) {
  execSync("git init");
  execSync("git add .");
  execSync('git commit -m "auto deploy"');

  const authUrl = repoUrl.replace(
    "https://",
    `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@`
  );

  execSync(`git remote add origin ${authUrl}`);
  execSync("git branch -M main");
  execSync("git push -u origin main");
}

module.exports = { createRepo, pushToGitHub };
