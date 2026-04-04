import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = './projects';

export async function saveFile(projectName, fileName, content) {
    const projectPath = path.join(BASE_DIR, projectName);
    await fs.mkdir(projectPath, { recursive: true });
    await fs.writeFile(path.join(projectPath, fileName), content);
    return true;
}

export async function checkFiles(projectName) {
    const projectPath = path.join(BASE_DIR, projectName);
    const requiredFiles = ['index.js', 'package.json', 'README.md'];
    const missingFiles = [];

    for (let file of requiredFiles) {
        try { await fs.access(path.join(projectPath, file)); }
        catch { missingFiles.push(file); }
    }
    return missingFiles;
}
