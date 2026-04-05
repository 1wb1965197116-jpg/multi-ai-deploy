const axios = require("axios");
const { execSync } = require("child_process");

async function createRepo() {
  const res = await axios.post(
    "https://api.github.com/user/repos",
    {
      name: process.env.REPO_NAME,
      private: false
    },
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  return res.data.clone_url;
}

function pushToGitHub(repoUrl) {
  execSync("git init", { stdio: "inherit" });
  execSync("git add .", { stdio: "inherit" });
  execSync('git commit -m "Auto deploy"', { stdio: "inherit" });

  const authUrl = repoUrl.replace(
    "https://",
    `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@`
  );

  execSync(`git remote add origin ${authUrl}`, { stdio: "inherit" });
  execSync("git branch -M main", { stdio: "inherit" });
  execSync("git push -u origin main", { stdio: "inherit" });
}

module.exports = { createRepo, pushToGitHub };
