// The previous implementation used shell commands and persisted a GitHub token
// in .git/config. Keep this integration disabled until a secure API-only uploader
// is implemented and reviewed.
async function createRepo() {
  throw new Error("GitHub repository creation is not enabled in this prototype.");
}

async function pushToGitHub() {
  throw new Error("GitHub file upload is not enabled in this prototype.");
}

module.exports = { createRepo, pushToGitHub };
