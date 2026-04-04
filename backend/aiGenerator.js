import fs from 'fs/promises';
import path from 'path';

export async function generateMissingFiles(projectName, missingFiles) {
    const projectPath = path.join('./projects', projectName);

    for (let file of missingFiles) {
        if (file === 'index.js') {
            await fs.writeFile(path.join(projectPath, 'index.js'), `console.log("Hello from ${projectName}")`);
        }
        if (file === 'package.json') {
            const pkg = {
                name: projectName.toLowerCase(),
                version: "1.0.0",
                main: "index.js",
                scripts: { start: "node index.js" }
            };
            await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(pkg, null, 2));
        }
        if (file === 'README.md') {
            await fs.writeFile(path.join(projectPath, 'README.md'), `# ${projectName}\nAuto-generated project.`);
        }
    }
}
