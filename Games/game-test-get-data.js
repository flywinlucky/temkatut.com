document.getElementById('initializeButton').addEventListener('click', function() {
    const folderName = document.getElementById('jsonFilename').value;
    if (folderName) {
        const baseUrl = window.location.origin.includes('localhost') ? `${window.location.origin}/Web Host Port/www.gifthouse.pro` : window.location.origin;
        fetch(`${baseUrl}/Games/profiles/${folderName}/game_data.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('File not found');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('dataContainer').innerText = JSON.stringify(data, null, 2);
                const img = document.createElement('img');
                img.src = `${baseUrl}/Games/profiles/${folderName}/${data['player-face']}`;
                img.alt = 'Player Face';
                img.style.width = '100%';
                img.style.height = '100%';
                const imageContainer = document.getElementById('imageContainer');
                imageContainer.innerHTML = '';
                imageContainer.appendChild(img);
            })
            .catch(error => {
                document.getElementById('dataContainer').innerText = 'Error: ' + error.message;
                console.error('Error fetching data:', error);
            });
    } else {
        document.getElementById('dataContainer').innerText = 'Please enter a folder name';
    }
});
