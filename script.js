const API_KEY = '6UYVQsTSJABDdcqJJZNw3pQZ'; // Replace with your actual API key

const imageInput = document.getElementById('imageInput');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const removeBackgroundButton = document.getElementById('removeBackground');
const downloadButton = document.getElementById('downloadButton');

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            originalImage.style.display = 'block';
            removeBackgroundButton.disabled = false;
            processedImage.style.display = 'none';
            downloadButton.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

removeBackgroundButton.addEventListener('click', async function() {
    const formData = new FormData();
    formData.append('image_file', imageInput.files[0]);

    removeBackgroundButton.disabled = true;
    removeBackgroundButton.textContent = 'Processing...';

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY
            },
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            processedImage.src = url;
            processedImage.style.display = 'block';
            downloadButton.href = url;
            downloadButton.download = 'removed-background.png';
            downloadButton.style.display = 'block';
        } else {
            throw new Error('Failed to remove background');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        removeBackgroundButton.disabled = false;
        removeBackgroundButton.textContent = 'Remove Background';
    }
});