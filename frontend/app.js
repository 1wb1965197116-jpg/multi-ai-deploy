const saveBtn = document.getElementById('saveBtn');
const deployBtn = document.getElementById('deployBtn');
const output = document.getElementById('output');

saveBtn.addEventListener('click', async () => {
    const res = await fetch('http://localhost:5000/save-file', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            projectName: document.getElementById('projectName').value,
            fileName: document.getElementById('fileName').value,
            content: document.getElementById('fileContent').value
        })
    });
    const data = await res.json();
    output.innerText = data.success ? 'File Saved' : 'Error Saving File';
});

deployBtn.addEventListener('click', async () => {
    const res = await fetch('http://localhost:5000/deploy', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            projectName: document.getElementById('projectName').value,
            platform: document.getElementById('platform').value
        })
    });
    const data = await res.json();
    output.innerText = data.message || JSON.stringify(data);
});
