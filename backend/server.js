app.post("/fix", async (req, res) => {
  const { checkAndFixProject } = require("./deployChecker");
  checkAndFixProject(path.join(__dirname, ".."));
  res.send("✅ Project fixed");
});

app.post("/deploy", async (req, res) => {
  const { platform } = req.body;

  try {
    await deployProject(platform);
    res.send("🚀 Deployed to " + platform);
  } catch (e) {
    console.error(e);
    res.status(500).send("❌ Deploy failed");
  }
});
