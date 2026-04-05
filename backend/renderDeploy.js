const axios = require("axios");

async function triggerRenderDeploy() {
  await axios.post(
    `https://api.render.com/v1/services/${process.env.RENDER_SERVICE_ID}/deploys`,
    {},
    {
      headers: {
        Authorization: `Bearer ${process.env.RENDER_API_KEY}`
      }
    }
  );
}

module.exports = { triggerRenderDeploy };
