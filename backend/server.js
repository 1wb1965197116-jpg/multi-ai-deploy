import express from 'express';
import cors from 'cors';
import { saveFile, checkFiles } from './fileManager.js';
import { deployToPlatform } from './deploy.js';
import { generateMissingFiles } from './aiGenerator.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/save-file', async (req, res) => {
    const { projectName, fileName, content } = req.body;
    const saved = await saveFile(projectName, fileName, content);
    res.json({ success: saved });
});

app.post('/deploy', async (req, res) => {
    const { projectName, platform } = req.body;

    let missingFiles = await checkFiles(projectName);
    if (missingFiles.length > 0) {
        // AI auto-generates missing files
        await generateMissingFiles(projectName, missingFiles);
        missingFiles = await checkFiles(projectName); // recheck
    }

    const result = await deployToPlatform(projectName, platform);
    res.json(result);
});

app.listen(5000, () => console.log('Backend running on port 5000'));
