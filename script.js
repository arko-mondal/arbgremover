class ImageProcessor {
    constructor() {
        this.API_KEY = '6UYVQsTSJABDdcqJJZNw3pQZ'; // Replace with your actual API key
        this.initializeElements();
        this.initializeEventListeners();
        this.processedImages = new Map();
    }

    initializeElements() {
        this.imageInput = document.getElementById('imageInput');
        this.imagesGrid = document.getElementById('imagesGrid');
        this.removeBackgroundButton = document.getElementById('removeBackground');
        this.downloadAllButton = document.getElementById('downloadAll');
        this.fileInfo = document.querySelector('.file-info');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingDots = document.querySelector('.loading-dots');
    }

    initializeEventListeners() {
        this.imageInput.addEventListener('change', (e) => this.handleImageSelection(e));
        this.removeBackgroundButton.addEventListener('click', () => this.processAllImages());
        this.downloadAllButton.addEventListener('click', () => this.downloadAllImages());
    }

    handleImageSelection(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        this.fileInfo.textContent = `${files.length} file(s) selected`;
        this.imagesGrid.innerHTML = '';
        this.processedImages.clear();
        
        files.forEach(file => this.createImageCard(file));
        this.removeBackgroundButton.disabled = false;
        this.downloadAllButton.style.display = 'none';
    }

    createImageCard(file) {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        const previewImg = document.createElement('img');
        previewImg.src = URL.createObjectURL(file);
        preview.appendChild(previewImg);
        
        const result = document.createElement('div');
        result.className = 'image-result';
        const resultImg = document.createElement('img');
        result.appendChild(resultImg);
        
        const status = document.createElement('div');
        status.className = 'image-status';
        status.textContent = 'Pending';
        
        card.appendChild(preview);
        card.appendChild(result);
        card.appendChild(status);
        this.imagesGrid.appendChild(card);
        
        this.processedImages.set(file, { 
            card, 
            status, 
            previewImg,
            resultImg 
        });
    }

    async processAllImages() {
        this.removeBackgroundButton.disabled = true;
        this.loadingDots.style.display = 'inline-block';
        this.loadingScreen.style.display = 'flex';

        const files = Array.from(this.imageInput.files);
        const promises = files.map(file => this.processImage(file));

        try {
            await Promise.all(promises);
            this.downloadAllButton.style.display = 'inline-block';
        } catch (error) {
            console.error('Error processing images:', error);
        } finally {
            this.removeBackgroundButton.disabled = false;
            this.loadingDots.style.display = 'none';
            this.loadingScreen.style.display = 'none';
        }
    }

    async processImage(file) {
        const { card, status, resultImg } = this.processedImages.get(file);
        status.textContent = 'Processing...';

        try {
            const formData = new FormData();
            formData.append('image_file', file);

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.API_KEY
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to remove background');

            const blob = await response.blob();
            const processedImageUrl = URL.createObjectURL(blob);
            
            resultImg.src = processedImageUrl;
            status.textContent = 'Completed';
            this.processedImages.get(file).blob = blob;
            
            card.classList.add('processed');
        } catch (error) {
            status.textContent = 'Failed';
            status.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
            console.error(`Error processing ${file.name}:`, error);
        }
    }

    downloadAllImages() {
        this.processedImages.forEach((data, file) => {
            if (data.blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(data.blob);
                link.download = `removed-bg-${file.name}`;
                link.click();
            }
        });
    }
}

// Initialize the image processor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageProcessor();
});