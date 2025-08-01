/**
 * OLPCC Frame Generator - Our Lady of the Pillar College–Cauayan
 * Features: Upload, Scale, Position, Preview, and Download framed photos
 * Compatible with desktop and mobile browsers
 */

class FrameGenerator {
    constructor() {
        // Canvas and context for rendering
        this.canvas = null;
        this.ctx = null;
        
        // Image objects
        this.userImage = null;
        this.frameImage = null;
        
        // Image properties
        this.imageScale = 1;
        this.imageX = 0;
        this.imageY = 0;
        
        // Canvas dimensions
        this.canvasWidth = 400;
        this.canvasHeight = 400;
        
        // Only use default frame.png
        this.frameImageSrc = 'frame.png';
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and loading frame
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadFrameImage();
        this.updateResponsiveCanvas();
    }

    /**
     * Get references to DOM elements
     */
    setupElements() {
        // Main elements
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.controlPanel = document.getElementById('controlPanel');
        this.previewSection = document.getElementById('previewSection');
        this.instructions = document.getElementById('instructions');
        this.loading = document.getElementById('loading');
        
        // Canvas
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Controls
        this.scaleSlider = document.getElementById('scaleSlider');
        this.positionXSlider = document.getElementById('positionXSlider');
        this.positionYSlider = document.getElementById('positionYSlider');
        
        // Value displays
        this.scaleValue = document.getElementById('scaleValue');
        this.positionXValue = document.getElementById('positionXValue');
        this.positionYValue = document.getElementById('positionYValue');
        
        // Buttons
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // File upload events
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadArea.addEventListener('click', (e) => {
            // Only trigger file input if the click is not on the file input itself
            if (e.target === this.uploadArea) {
                this.imageInput.click();
            }
        });
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events
        this.scaleSlider.addEventListener('input', (e) => this.handleScaleChange(e));
        this.positionXSlider.addEventListener('input', (e) => this.handlePositionXChange(e));
        this.positionYSlider.addEventListener('input', (e) => this.handlePositionYChange(e));
        
        // Button events
        this.resetBtn.addEventListener('click', () => this.resetPosition());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        // Window events
        window.addEventListener('resize', () => this.updateResponsiveCanvas());
    }

    /**
     * Load the decorative frame image (now supports multiple frames)
     */
    loadFrameImage() {
        this.frameImage = new Image();
        this.frameImage.onload = () => {
            if (this.userImage) this.renderPreview();
        };
        this.frameImage.onerror = () => {
            this.showError('Frame image could not be loaded. Please check if the frame image exists.');
        };
        this.frameImage.src = this.frameImageSrc;
    }

    /**
     * Update canvas size based on screen size
     */
    updateResponsiveCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(400, container.clientWidth - 40);
        
        // Update display size
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxWidth + 'px';
        
        // Keep internal resolution consistent
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Redraw if we have an image
        if (this.userImage) {
            this.renderPreview();
        }
    }

    /**
     * Handle file selection from input
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
        // Reset file input so selecting the same file again will trigger change
        event.target.value = '';
    }

    /**
     * Handle drag over event
     */
    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    /**
     * Handle drop event
     */
    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (this.isValidImageFile(file)) {
                this.processImageFile(file);
            } else {
                this.showError('Please upload a valid image file (JPG, PNG, GIF, WebP)');
            }
        }
    }

    /**
     * Check if file is a valid image
     */
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    }

    /**
     * Process the uploaded image file
     */
    processImageFile(file) {
        if (!this.isValidImageFile(file)) {
            this.showError('Please upload a valid image file (JPG, PNG, GIF, WebP)');
            return;
        }

        // Show loading
        this.showLoading();

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadUserImage(e.target.result);
        };
        reader.onerror = () => {
            this.hideLoading();
            this.showError('Failed to read the image file');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Load user image from data URL
     */
    loadUserImage(dataUrl) {
        this.userImage = new Image();
        this.userImage.onload = () => {
            this.hideLoading();
            this.resetControls();
            this.showPreviewInterface();
            this.renderPreview();
        };
        this.userImage.onerror = () => {
            this.hideLoading();
            this.showError('Failed to load the image');
        };
        this.userImage.src = dataUrl;
    }

    /**
     * Reset all controls to default values
     */
    resetControls() {
        this.imageScale = 1;
        this.imageX = 0;
        this.imageY = 0;
        
        this.scaleSlider.value = 1;
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        
        this.updateControlValues();
    }

    /**
     * Reset position to center
     */
    resetPosition() {
        this.imageX = 0;
        this.imageY = 0;
        
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        
        this.updateControlValues();
        this.renderPreview();
    }

    /**
     * Show preview interface after image upload
     */
    showPreviewInterface() {
        // Hide instructions first
        this.instructions.classList.add('hidden');
        
        // Remove hidden class and add visible class
        this.previewSection.classList.remove('hidden');
        this.previewSection.classList.add('visible');
        
        // Force immediate visibility with multiple approaches
        this.previewSection.style.display = 'flex';
        this.previewSection.style.visibility = 'visible';
        this.previewSection.style.opacity = '1';
        this.previewSection.style.height = 'auto';
        this.previewSection.style.overflow = 'visible';
        
        // Force a reflow to ensure proper rendering
        this.previewSection.offsetHeight;
        
        // Ensure the preview section is visible and scroll to it
        setTimeout(() => {
            this.previewSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
        
        // Double-check visibility after a delay
        setTimeout(() => {
            if (this.previewSection.classList.contains('hidden')) {
                this.previewSection.classList.remove('hidden');
                this.previewSection.classList.add('visible');
            }
        }, 200);
    }

    /**
     * Handle scale slider change
     */
    handleScaleChange(event) {
        this.imageScale = parseFloat(event.target.value);
        this.updateControlValues();
        this.renderPreview();
    }

    /**
     * Handle position X slider change
     */
    handlePositionXChange(event) {
        this.imageX = parseInt(event.target.value);
        this.updateControlValues();
        this.renderPreview();
    }

    /**
     * Handle position Y slider change
     */
    handlePositionYChange(event) {
        this.imageY = parseInt(event.target.value);
        this.updateControlValues();
        this.renderPreview();
    }

    /**
     * Update control value displays
     */
    updateControlValues() {
        this.scaleValue.textContent = this.imageScale.toFixed(1);
        this.positionXValue.textContent = this.imageX.toString();
        this.positionYValue.textContent = this.imageY.toString();
    }

    /**
     * Render the preview with user image and frame
     */
    renderPreview() {
        if (!this.userImage || !this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Calculate image dimensions and position
        const { width, height, x, y } = this.calculateImageDimensions();

        // Draw user image
        this.ctx.drawImage(
            this.userImage,
            x + this.imageX,
            y + this.imageY,
            width,
            height
        );

        // Draw frame overlay if available
        if (this.frameImage && this.frameImage.complete) {
            this.ctx.drawImage(
                this.frameImage,
                0,
                0,
                this.canvasWidth,
                this.canvasHeight
            );
        }
    }

    /**
     * Calculate scaled image dimensions and center position
     */
    calculateImageDimensions() {
        const aspectRatio = this.userImage.width / this.userImage.height;
        
        let width, height;
        
        // Scale image to fit canvas while maintaining aspect ratio
        if (aspectRatio > 1) {
            // Landscape image
            width = this.canvasWidth * this.imageScale;
            height = width / aspectRatio;
        } else {
            // Portrait or square image
            height = this.canvasHeight * this.imageScale;
            width = height * aspectRatio;
        }
        
        // Center the image
        const x = (this.canvasWidth - width) / 2;
        const y = (this.canvasHeight - height) / 2;
        
        return { width, height, x, y };
    }

    /**
     * Download the framed image
     */
    downloadImage() {
        if (!this.userImage) {
            this.showError('No image to download');
            return;
        }

        this.showLoading();

        // Create a high-resolution canvas for export
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // Set export dimensions (higher resolution)
        const exportSize = 800;
        exportCanvas.width = exportSize;
        exportCanvas.height = exportSize;

        // Calculate scaled dimensions for export
        const scale = exportSize / this.canvasWidth;
        const { width, height, x, y } = this.calculateImageDimensions();

        // Draw user image on export canvas
        exportCtx.drawImage(
            this.userImage,
            (x + this.imageX) * scale,
            (y + this.imageY) * scale,
            width * scale,
            height * scale
        );

        // Draw frame if available
        if (this.frameImage && this.frameImage.complete) {
            exportCtx.drawImage(
                this.frameImage,
                0,
                0,
                exportSize,
                exportSize
            );
        }

        // Convert to blob and download
        exportCanvas.toBlob((blob) => {
            this.hideLoading();
            
            if (blob) {
                this.triggerDownload(blob);
            } else {
                this.showError('Failed to generate image for download');
            }
        }, 'image/png', 1.0);
    }

    /**
     * Trigger download using blob URL (works on desktop and mobile)
     */
    triggerDownload(blob) {
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            // Use a descriptive filename
            const filename = 'olpcc-framed-photo.png';
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up blob URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            this.showSuccess('Image downloaded successfully!');
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Download failed. Please try again.');
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.loading.classList.remove('hidden');
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.loading.classList.add('hidden');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show notification (toast-style message)
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '1001',
            maxWidth: '300px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#dc2626' : 
                           type === 'success' ? '#16a34a' : '#2563eb'
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        new FrameGenerator();
        console.log('Frame Generator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Frame Generator:', error);
        
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #dc2626;
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                z-index: 1000;
                max-width: 90%;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            ">
                <h3>Application Error</h3>
                <p>Failed to initialize the Frame Generator. Please refresh the page and try again.</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #dc2626;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 10px;
                    cursor: pointer;
                    font-weight: 600;
                ">Refresh Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

/**
 * Service Worker registration for better mobile experience (optional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Only register if we have a service worker file
        // This is commented out since we're not creating a SW file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

/**
 * Handle orientation change on mobile devices
 */
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (window.frameGenerator) {
            window.frameGenerator.updateResponsiveCanvas();
        }
    }, 100);
});

/**
 * Prevent default drag behavior on document
 */
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
